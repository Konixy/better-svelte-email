import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock modules before importing the module under test
vi.mock('fs');
// Don't mock 'path' - we want to use the real implementation for cross-platform testing
vi.mock('resend');
vi.mock('svelte/server');
vi.mock('prettier/standalone');
vi.mock('prettier/parser-html');

// Import the functions we're testing
import { emailList, getFiles, getEmailComponent } from './index.js';

describe('Preview Path Resolution - Cross-Platform', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('emailList - Unix paths (Mac/Linux)', () => {
		it('should list email files with Unix-style paths', () => {
			const mockRoot = '/home/user/project';
			const mockEmailPath = '/src/lib/emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['Welcome.svelte', 'Reset.svelte'] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.path).toBe(mockEmailPath);
			expect(result.files).toHaveLength(2);
			expect(result.files).toContain('Welcome');
			expect(result.files).toContain('Reset');
		});

		it('should handle nested directories with Unix paths', () => {
			const mockRoot = '/home/user/project';
			const mockEmailPath = '/src/lib/emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);

			// Mock readdirSync to return directory first, then files
			vi.mocked(fs.readdirSync)
				.mockReturnValueOnce(['auth'] as any)
				.mockReturnValueOnce(['Login.svelte', 'Register.svelte'] as any);

			// Mock statSync to indicate first is directory, rest are files
			vi.mocked(fs.statSync)
				.mockReturnValueOnce({ isDirectory: () => true } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toHaveLength(2);
			// Files should be in auth subfolder
			expect(result.files?.every((file) => file.includes('auth'))).toBe(true);
		});

		it('should return null when directory does not exist', () => {
			const mockRoot = '/home/user/project';
			const mockEmailPath = '/src/lib/emails';

			vi.mocked(fs.existsSync).mockReturnValue(false);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toBeNull();
			expect(result.path).toBe(mockEmailPath);
		});
	});

	describe('emailList - Windows paths', () => {
		it('should list email files with Windows-style paths', () => {
			const mockRoot = 'C:\\Users\\user\\project';
			const mockEmailPath = '\\src\\lib\\emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['Welcome.svelte', 'Reset.svelte'] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toHaveLength(2);
			expect(result.files).toContain('Welcome');
			expect(result.files).toContain('Reset');
		});

		it('should handle nested directories with Windows paths', () => {
			const mockRoot = 'C:\\Users\\user\\project';
			const mockEmailPath = '\\src\\lib\\emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);

			vi.mocked(fs.readdirSync)
				.mockReturnValueOnce(['auth'] as any)
				.mockReturnValueOnce(['Login.svelte', 'Register.svelte'] as any);

			vi.mocked(fs.statSync)
				.mockReturnValueOnce({ isDirectory: () => true } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toHaveLength(2);
			// On Windows, paths should contain backslashes
			expect(result.files?.every((file) => file.includes('auth'))).toBe(true);
		});
	});

	describe('getEmailComponent - path normalization', () => {
		it('should normalize Windows backslashes to forward slashes in import paths', async () => {
			const emailPath = 'C:\\Users\\user\\project\\src\\lib\\emails';
			const file = 'auth\\Welcome';

			try {
				await getEmailComponent(emailPath, file);
				expect(false).toBe(true); // Should not reach here
			} catch (error) {
				// Expected to fail since component doesn't exist
				expect(error).toBeDefined();
				const errorMessage = (error as Error).message;
				// Verify the path was normalized (should contain forward slashes)
				expect(errorMessage).toContain('auth/Welcome');
			}
		});

		it('should remove trailing slashes from emailPath', async () => {
			const emailPath = '/src/lib/emails/';
			const file = 'Welcome';

			try {
				await getEmailComponent(emailPath, file);
				expect(false).toBe(true);
			} catch (error) {
				expect(error).toBeDefined();
				// Should not have double slashes
				const errorMessage = (error as Error).message;
				expect(errorMessage).not.toContain('//');
			}
		});

		it('should remove leading slashes from file parameter', async () => {
			const emailPath = '/src/lib/emails';
			const file = '/auth/Welcome';

			try {
				await getEmailComponent(emailPath, file);
				expect(false).toBe(true);
			} catch (error) {
				expect(error).toBeDefined();
				const errorMessage = (error as Error).message;
				// Should normalize properly
				expect(errorMessage).toContain('auth/Welcome');
			}
		});

		it('should handle Unix-style paths', async () => {
			const emailPath = '/home/user/project/src/lib/emails';
			const file = 'auth/Welcome';

			try {
				await getEmailComponent(emailPath, file);
				expect(false).toBe(true);
			} catch (error) {
				expect(error).toBeDefined();
			}
		});
	});

	describe('getFiles - recursive file discovery', () => {
		it('should recursively get all files from directory', () => {
			const mockDir = '/home/user/project/emails';

			vi.mocked(fs.readdirSync)
				.mockReturnValueOnce(['Welcome.svelte', 'auth'] as any)
				.mockReturnValueOnce(['Login.svelte'] as any);

			vi.mocked(fs.statSync)
				.mockReturnValueOnce({ isDirectory: () => false } as any)
				.mockReturnValueOnce({ isDirectory: () => true } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any);

			const files = getFiles(mockDir);

			expect(files).toHaveLength(2);
			expect(files.some((f) => f.includes('Welcome.svelte'))).toBe(true);
			expect(files.some((f) => f.includes('Login.svelte'))).toBe(true);
		});

		it('should handle deeply nested directories', () => {
			const mockDir = '/project/emails';

			vi.mocked(fs.readdirSync)
				.mockReturnValueOnce(['level1'] as any)
				.mockReturnValueOnce(['level2'] as any)
				.mockReturnValueOnce(['Deep.svelte'] as any);

			vi.mocked(fs.statSync)
				.mockReturnValueOnce({ isDirectory: () => true } as any)
				.mockReturnValueOnce({ isDirectory: () => true } as any)
				.mockReturnValueOnce({ isDirectory: () => false } as any);

			const files = getFiles(mockDir);

			expect(files).toHaveLength(1);
			expect(files[0]).toContain('Deep.svelte');
		});

		it('should return empty array for empty directory', () => {
			const mockDir = '/project/emails';
			vi.mocked(fs.readdirSync).mockReturnValue([] as any);

			const files = getFiles(mockDir);

			expect(files).toEqual([]);
		});
	});

	describe('emailList - process.cwd() fallback', () => {
		it('should use process.cwd() when root is not provided', () => {
			const mockCwd = '/current/working/directory';
			const originalCwd = process.cwd;
			process.cwd = vi.fn().mockReturnValue(mockCwd);

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['Test.svelte'] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

			const result = emailList();

			expect(process.cwd).toHaveBeenCalled();
			expect(result.files).toHaveLength(1);

			process.cwd = originalCwd;
		});

		it('should throw error when process.cwd() fails and root is not provided', () => {
			const originalCwd = process.cwd;
			process.cwd = vi.fn().mockImplementation(() => {
				throw new Error('process.cwd() failed');
			});

			expect(() => emailList()).toThrow(/Could not determine the root path/);

			process.cwd = originalCwd;
		});
	});

	describe('Edge cases - path handling', () => {
		it('should handle empty directory gracefully', () => {
			const mockRoot = '/home/user/project';
			const mockEmailPath = '/src/lib/emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue([] as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toBeNull();
		});

		it('should only include .svelte files', () => {
			const mockRoot = '/home/user/project';
			const mockEmailPath = '/src/lib/emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue([
				'Email.svelte',
				'Email.ts',
				'Email.js',
				'README.md',
				'Another.svelte'
			] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toHaveLength(2);
			expect(result.files).toContain('Email');
			expect(result.files).toContain('Another');
		});

		it('should handle UNC paths on Windows', () => {
			const mockRoot = '\\\\server\\share\\project';
			const mockEmailPath = '\\src\\lib\\emails';

			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readdirSync).mockReturnValue(['Test.svelte'] as any);
			vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any);

			const result = emailList({ path: mockEmailPath, root: mockRoot });

			expect(result.files).toHaveLength(1);
			expect(result.files).toContain('Test');
		});
	});
});
