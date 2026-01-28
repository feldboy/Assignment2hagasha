import mongoose from 'mongoose';
import connectDB from '../config/database';

// Mock mongoose
jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

describe('Database Configuration', () => {
    const mockConnect = mongoose.connect as jest.MockedFunction<typeof mongoose.connect>;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('should connect to MongoDB successfully with default URI', async () => {
        mockConnect.mockResolvedValueOnce(mongoose as any);

        await connectDB();

        expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/assignment2');
        expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB Connected...');
    });

    it('should connect to MongoDB successfully with custom URI', async () => {
        const customURI = 'mongodb://custom:27017/testdb';
        process.env.MONGODB_URI = customURI;
        mockConnect.mockResolvedValueOnce(mongoose as any);

        await connectDB();

        expect(mockConnect).toHaveBeenCalledWith(customURI);
        expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB Connected...');

        delete process.env.MONGODB_URI;
    });

    it('should handle connection errors and exit process', async () => {
        const error = new Error('Connection failed');
        mockConnect.mockRejectedValueOnce(error);

        await connectDB();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Connection failed');
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });
});
