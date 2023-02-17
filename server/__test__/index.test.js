const request = require('supertest');
const baseURL = 'http://localhost:3000';

const newProduct = {
  "id": 1,
  "name": "Camo Onesie",
  "slogan": "Blend in to your crowd",
  "description": "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
  "category": "Jackets",
  "default_price": "140.00",
  "features": [
      {
          "feature": "Fabric",
          "value": "Canvas"
      },
      {
          "feature": "Buttons",
          "value": "Brass"
      }
  ]
}


describe('GET all routes in productsAPI', () => {

  it('should return 200 from /products', async () => {
    const response = await request(baseURL).get('/products');
    expect(response.statusCode).toBe(200);
    expect(response.error).toBe(false);
  })

  it('should return 200 from /products/:id', async () => {
    const response = await request(baseURL).get('/products/1');
    expect(response.statusCode).toBe(200);
    expect(response.error).toBe(false);
  })

  it('should return 200 from /products/:id/styles', async () => {
    const response = await request(baseURL).get('/products/1/styles');
    expect(response.statusCode).toBe(200);
    expect(response.error).toBe(false);
  })

  it('should return 200 from /products/:id/related', async () => {
    const response = await request(baseURL).get('/products/1/related');
    expect(response.statusCode).toBe(200);
    expect(response.error).toBe(false);
  })

})

describe('GET /products', () => {
  it ('should return an array of 5', async () => {
    const response = await request(baseURL).get('/products');
    expect(response.body.length).toBe(5);
  })
})

describe('GET /products/:id', () => {
  it ('should return a product object with an id', async () => {
    const response = await request(baseURL).get('/products/123');
    expect(response.body.id).toBe(123);
  })
})

describe('GET /products/:id/styles', () => {
  it ('should return a styles object with a product_id (in string form)', async () => {
    const response = await request(baseURL).get('/products/333/styles');
    expect(response.body.product_id).toBe('333');
  })
})

describe('GET /products/:id/related', () => {
  it ('should return an related ids array with a length of 3', async () => {
    const response = await request(baseURL).get('/products/800/related');
    expect(response.body.length).toBe(3);
  })
})