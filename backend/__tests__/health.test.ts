import { GET } from '../src/app/api/health/route';

describe('Health Check API', () => {
  it('should return 200 OK and status ok', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('timestamp');
  });
});
