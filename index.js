const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

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
    const texto = await response.text()
    const texto2 = texto.replace(/["\[\]{}\\]/g, '').trim()
    const contrato = texto2.match(/^(\d+)/)?.[1] || null
    const refPag = texto2.match(/Ref\.Pag\.:(\S+)/)?.[1] || null
    const dirSer = texto2.match(/Dir\.Ser\.:\s*(.+?)(\s*)$/)?.[1]?.trim() || null
    res.json({ contrato: contrato, referencia_pago: refPag, direccion_servicio: dirSer })
  } catch (e) {
    res.status(500).json({ error: 'Error consultando la API' })
  }
})

app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT))
