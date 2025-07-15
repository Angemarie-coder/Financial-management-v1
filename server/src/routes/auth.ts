// src/routes/auth.ts
import { Router } from 'express';
import { getRepository, MoreThan } from 'typeorm';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/config';
import { sendEmail } from '../services/mailService'; // We only need the sendEmail function
import { UserRole } from '../entity/User'; // Added import for UserRole
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const userRepository = () => getRepository(User);

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }
    try {
        const user = await userRepository().findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        // --- Force password change and expiry logic ---
        if (user.mustChangePassword) {
            if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
                return res.status(403).json({ message: 'Your temporary password has expired. Please use the Forgot Password link to set a new password.' });
            }
        }
        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn }, (err, token) => {
            if (err) throw err;
            if (user.mustChangePassword) {
                res.json({ token, mustChangePassword: true });
            } else {
                res.json({ token });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }
    try {
        const existingUser = await userRepository().findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with that email already exists.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const user = userRepository().create({
            name,
            email,
            passwordHash,
            role: UserRole.VIEWER, // Default role for self-registration
            isEmailVerified: false,
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: verificationExpires,
        });
        await userRepository().save(user);
        // Send verification email
        const verifyUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        const message = `Welcome to the Financial Manager Platform!\n\nPlease verify your email by clicking the link below. This link is valid for 24 hours.\n\n${verifyUrl}`;
        await sendEmail({
            to: user.email,
            subject: 'Verify your email - Financial Manager Platform',
            text: message,
        });
        res.status(201).json({ success: true, message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await userRepository().findOne({ where: { email: req.body.email } });
        if (!user) {
            // We still send a success response to prevent email enumeration attacks
            return res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await userRepository().save(user);

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; // This link will go to our frontend app
        const message = `You requested a password reset. Please click the following link to set a new password. This link is valid for 15 minutes.\n\n${resetUrl}`;
        
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request - Financial Manager Platform',
            text: message,
        });

        res.status(200).json({ success: true, message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (err) {
        // Generic error for the client, detailed error is logged on the server by the mail service
        res.status(500).json({ message: 'Error processing request.' });
    }
});

// @route   PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await userRepository().findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: MoreThan(new Date()),
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }
        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await userRepository().save(user);
        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await userRepository().findOne({
            where: {
                emailVerificationToken: hashedToken,
                emailVerificationExpires: MoreThan(new Date()),
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Verification token is invalid or has expired.' });
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await userRepository().save(user);
        res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for logged-in user
// @access  Private
router.put('/change-password', protect, async (req: AuthRequest, res) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }
    try {
        const user = await userRepository().findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.mustChangePassword = false;
        user.passwordExpiresAt = undefined;
        await userRepository().save(user);
        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
