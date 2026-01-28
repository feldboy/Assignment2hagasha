import { swaggerSpec } from '../config/swagger';

describe('Swagger Configuration', () => {
    const spec = swaggerSpec as any;

    it('should have valid swagger specification', () => {
        expect(spec).toBeDefined();
        expect(spec.openapi).toBe('3.0.0');
    });

    it('should have correct API info', () => {
        expect(spec.info).toBeDefined();
        expect(spec.info.title).toBe('Assignment 2 REST API');
        expect(spec.info.version).toBe('1.0.0');
        expect(spec.info.description).toBe('REST API with Users, Posts, Comments, and JWT Authentication');
    });

    it('should have development server configured', () => {
        expect(spec.servers).toBeDefined();
        expect(spec.servers).toHaveLength(1);
        expect(spec.servers[0].url).toBe('http://localhost:3000');
        expect(spec.servers[0].description).toBe('Development server');
    });

    it('should have bearer authentication configured', () => {
        expect(spec.components).toBeDefined();
        expect(spec.components.securitySchemes).toBeDefined();
        expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
        expect(spec.components.securitySchemes.bearerAuth.type).toBe('http');
        expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
        expect(spec.components.securitySchemes.bearerAuth.bearerFormat).toBe('JWT');
    });

    it('should have User schema defined', () => {
        expect(spec.components.schemas).toBeDefined();
        expect(spec.components.schemas.User).toBeDefined();
        expect(spec.components.schemas.User.type).toBe('object');
        expect(spec.components.schemas.User.properties).toBeDefined();
        expect(spec.components.schemas.User.properties).toHaveProperty('_id');
        expect(spec.components.schemas.User.properties).toHaveProperty('username');
        expect(spec.components.schemas.User.properties).toHaveProperty('email');
    });

    it('should have Post schema defined', () => {
        expect(spec.components.schemas.Post).toBeDefined();
        expect(spec.components.schemas.Post.type).toBe('object');
        expect(spec.components.schemas.Post.properties).toHaveProperty('_id');
        expect(spec.components.schemas.Post.properties).toHaveProperty('title');
        expect(spec.components.schemas.Post.properties).toHaveProperty('content');
    });

    it('should have Comment schema defined', () => {
        expect(spec.components.schemas.Comment).toBeDefined();
        expect(spec.components.schemas.Comment.type).toBe('object');
        expect(spec.components.schemas.Comment.properties).toHaveProperty('_id');
        expect(spec.components.schemas.Comment.properties).toHaveProperty('post');
        expect(spec.components.schemas.Comment.properties).toHaveProperty('content');
    });

    it('should have AuthTokens schema defined', () => {
        expect(spec.components.schemas.AuthTokens).toBeDefined();
        expect(spec.components.schemas.AuthTokens.properties).toHaveProperty('accessToken');
        expect(spec.components.schemas.AuthTokens.properties).toHaveProperty('refreshToken');
    });

    it('should have Error schema defined', () => {
        expect(spec.components.schemas.Error).toBeDefined();
        expect(spec.components.schemas.Error.properties).toHaveProperty('message');
    });
});
