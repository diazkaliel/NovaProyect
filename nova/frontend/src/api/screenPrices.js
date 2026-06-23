import api from './client'

export const getScreenPrices = () => api.get('/screen-prices/')
export const createScreenPrice = (data) => api.post('/screen-prices/', data)
