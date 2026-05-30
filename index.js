const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/cliente', async (req, res) => {
  const numero = req.query.numero
  if (!numero) return res.status(400).json({ error: 'Falta el numero' })

  try {
    const response = await fetch(
      'https://legon-pruebas.sigmapro.work/contrato-api/buscar-con-documento?tipo=1&numero=' + numero,
      {
        headers: {
          'Authorization': 'Basic Z3VpbGxlcm1vcGF0aW5vY2hAZ21haWwuY29tOjg1MDczOTc=',
          'Accept': 'application/json'
        }
      }
    )
    const data = await response.json()
    const item = data[0]
    const contrato = item.id ? String(item.id) : null
    const refPag = item.text?.match(/Ref\.Pag\.:(\S+)/)?.[1] || null
    const dirSer = item.text?.match(/Dir\.Ser\.:\s*(.+)$/)?.[1]?.trim() || null
    res.json({ contrato: contrato, referencia_pago: refPag, direccion_servicio: dirSer })
  } catch(e) {
    res.status(500).json({ error: 'Error consultando la API' })
  }
})

app.get('/referencia', async (req, res) => {
  const { referencia_pago } = req.query
  if (!referencia_pago) return res.status(400).json({ error: 'Falta referencia_pago' })

  try {
    const response = await fetch(
      'https://legon-pruebas.sigmapro.work/contrato-api/buscar-con-referencia?expand=direcciones,productos',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic Z3VpbGxlcm1vcGF0aW5vY2hAZ21haWwuY29tOjg1MDczOTc=',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ datos: { referencia_pago: referencia_pago } })
      }
    )
    const data = await response.json()
    const c = data.contrato
    const direccion = c.direcciones?.[0]?.direccion || null
    const productos = c.productos?.map(p => p._producto).join(', ') || null

    res.json({
      cliente: c._cliente,
      contrato_id: String(c.id),
      referencia_pago: c.referencia_pago,
      direccion: direccion,
      productos: productos,
      sucursal: c._sucursal
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT))
