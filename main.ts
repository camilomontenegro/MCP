import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

//Create server.
//It is the main interface to the Model Context Protocol: Handles coms with the client and server.

const server = new McpServer({
  name: 'demo',
  version: '1.0.0'
})

//Define tools.
//Tools allow the LLM to perform actions through my server.

server.tool(
  'fetch-weather', //Tool title
  'Tool to fetch the weather of a city', //Tool description
  {
    city: z.string().describe('City name')
  },
  async ({ city }) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
    )
    const data = await response.json()
    if (!data.results || data.results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No se encontró info para la ciudad ${city}.`
          }
        ]
      }
    }

    const { latitude, longitude } = data.results[0]

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,precipitation,is_day,rain&forecast_days=1`
    )

    const weatherData = await weatherResponse.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(weatherData, null, 2)
        }
      ]
    }
  }
)

//Listen to clients connections.
const transport = new StdioServerTransport()
await server.connect(transport)
