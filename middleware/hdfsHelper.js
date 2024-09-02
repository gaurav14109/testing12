
const kerberos = require('kerberos')
const axios = require('axios')
const https = require('https')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const getSystemToken = async () => {
    const kerberosClienrt = await kerberos.initializeClient('HTTP/edlvduna002.ubimarigold.in@UBIMARIGOLD.in', { user: "edlgapdev@ubimarigold.in", password: "Thursday@0724" })
    const ticket = await kerberosClienrt.step('')
    return ticket
}

const getDelegationToken = async (token) => {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false
        })
        const options = {
            httpsAgent: agent,
            headers: {
                'Authorization': `Negotiate ${token}`,
                'Content-Type': 'application/octet-stream'
            },
        }
        const res = await axios.get('http://localhost:9870/webhdfs/v1/?op=GETDELEGATIONTOKEN', options)

        return res.data.Token.urlString
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = { getSystemToken, getDelegationToken }