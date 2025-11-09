import { z } from 'zod';

export const RSVPSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	phone: z.string().optional().default(''),
	attending: z.enum(['yes', 'no', 'maybe']),
	guestCount: z.number().min(1).max(10),
	dietaryRestrictions: z.string().optional().default(''),
	message: z.string().optional().default(''),
});

export type RSVP = z.infer<typeof RSVPSchema>;

export const WishesSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type Wishes = z.infer<typeof WishesSchema>;

export const ContactSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(5, 'Subject must be at least 5 characters'),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type Contact = z.infer<typeof ContactSchema>;
