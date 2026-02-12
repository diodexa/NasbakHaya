export const sendOrderToSheet = async (orderData) => {
  const URL = "https://script.google.com/macros/s/AKfycbxfXJJNhNtXqTkwbHwcoJo5enRGQqNWqQ4aB2sflIk9TFHlFF491ScaAtca8KrnGMY/exec"

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
  const URL = "https://script.google.com/macros/s/AKfycbxfXJJNhNtXqTkwbHwcoJo5enRGQqNWqQ4aB2sflIk9TFHlFF491ScaAtca8KrnGMY/exec"

  const response = await fetch(URL)

  if (!response.ok) {
    throw new Error("Gagal fetch data")
  }

  return await response.json()
}
