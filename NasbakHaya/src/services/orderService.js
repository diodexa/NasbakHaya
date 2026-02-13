const URL = "https://script.google.com/macros/s/AKfycbxTEI-8DpkFbtYAdWkEO1UTQuTjAjFYzCq29TCAALfi79fWV_UIbGLP4Ml8T9THEcmV/exec"
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