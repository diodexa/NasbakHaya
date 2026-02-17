const URL = "https://script.google.com/macros/s/AKfycbyFgctvF4eNmv5kmBRKvtRSWDbARbDA5-IW5OtuBON-iyve4DzI-N0J6Qo_FHxroDVM/exec"
export const sendOrderToSheet = async (orderData) => {

  await fetch(URL, {
    method: "POST",
    mode: "no-cors", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
}

export const fetchTodayOrders = async () => {

  const response = await fetch(URL)

  if (!response.ok) {
    throw new Error("Gagal fetch data")
  }

  return await response.json()
}

export const fetchMenuControl = async () => {
  const Base = URL + "?type=menu"
  const res = await fetch(Base)
  return await res.json()
}

export const fetchOrdersByDate = async (date) => {

  const response = await fetch(`${URL}?date=${date}`)

  if (!response.ok) {
    throw new Error("Gagal fetch data by date")
  }

  return await response.json()
}