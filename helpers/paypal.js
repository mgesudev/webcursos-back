const axios = require("axios")
const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET, PAYPAL_BASE_URL } = process.env

const createOrder = async (price) => {
  const accessToken = await generateAccessToken()

  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`
  try {
    const { data } = await axios({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      },
    })

    return { ok: true, data }
  } catch (error) {
    return { ok: false, data: error }
  }
}

const capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken()
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`
  try {
    const { data } = await axios({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
    console.log({ data: data.purchase_units[0] })

    return { ok: true, data }
  } catch (error) {
    console.log({ error })
    return { ok: false, data: error }
  }
}

const refundPayment = async (caputreId) => {
  const accessToken = await generateAccessToken()

  const url = `${PAYPAL_BASE_URL}/v2/payments/captures/${caputreId}/refund`
  try {
    const response = await axios({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return { ok: true, data: response.data }
  } catch (error) {
    return { ok: false, data: error }
  }
}

async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString(
    "base64"
  )

  try {
    const { data } = await axios({
      url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: "POST",
      data: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    return data.access_token
  } catch (error) {
    console.log({ error })
  }
}

module.exports = {
  createOrder,
  capturePayment,
  refundPayment,
}
