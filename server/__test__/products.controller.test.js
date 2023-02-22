const db = require('../config/database');
const productControllers = require('../controllers/products.controller');

describe('Testing all controllers in productsAPI', () => {

  afterAll(() => {
    db.closeConnection();
  })

  it('productsIndex should return an array of objects (testing for page 195000, count 5)', async () => {
    const req = {query: {page: 195000, count: 5}};

    const res = {
      result: '',
      resultStatus: '',
      send: function(input) {
        this.result = input;
      },
      status: function(input) {
        this.resultStatus = input;
      }
    }

    let result = await productControllers.productsIndex(req, res);
    console.log(res.result.length);
    expect(res.result.length).toBe(5);
  })

  it('productsId should return an object with an id that matches the param id: 995000', async () => {
    const req = {params: {id: 995000}};

    const res = {
      result: '',
      resultStatus: '',
      send: function(input) {
        this.result = input;
      },
      status: function(input) {
        this.resultStatus = input;
      }
    }

    await productControllers.productsId(req, res);
    expect(res.result.id).toBe(995000);
  })

  it('productsIdStyles should return an object with an id that matches the param', async () => {
    const req = {params: {id: 989000}};

    const res = {
      result: '',
      resultStatus: '',
      send: function(input) {
        this.result = input;
      },
      status: function(input) {
        this.resultStatus = input;
      },
      end: () => {},

    }

    await productControllers.productsIdStyles(req, res);
    expect(res.result.results.length).toBeTruthy();
  })


  it('productsIdRelated should return an array of related ids', async () => {
    const req = {params: {id: 997000}};

    const res = {
      result: '',
      resultStatus: '',
      send: function(input) {
        this.result = input;
      },
      status: function(input) {
        this.resultStatus = input;
      },
      end: () => {},
    }

    await productControllers.productsIdRelated(req, res);
    console.log(res);
    expect(res.result.length).toBe(3);
  })


})