import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'ai-color-analysis-app-deglv1hq',
  authRequired: true
})

export default blink