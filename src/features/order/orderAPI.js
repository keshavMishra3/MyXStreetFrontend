const BASE_URL = process.env.REACT_APP_BACKEND_API_BASE_URL;

export function createOrder(order) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updateOrder(order) {
  return new Promise(async (resolve) => {
    const response = await fetch(`${BASE_URL}/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchAllOrders(sort, pagination) {
  let queryString = '';

  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`;
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }

  return new Promise(async (resolve) => {
    const response = await fetch(`${BASE_URL}/orders?${queryString}`, {
      credentials: 'include',
    });
    const data = await response.json();
    const totalOrders = await response.headers.get('X-Total-Count');
    resolve({ data: { orders: data, totalOrders: +totalOrders } });
  });
}
