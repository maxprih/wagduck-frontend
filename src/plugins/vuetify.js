import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'


import { createVuetify } from 'vuetify'


export default createVuetify({
  theme: {

    defaultTheme: 'oceanicDark',
    themes: {
      oceanicLight: {
        dark: false,
        colors: {
          primary: '#3A8F8A',
          secondary: '#F0F4F8',
          accent: '#FF7F50',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          background: '#FFFFFF',
          surface: '#FDFDFD',
        },
      },
      oceanicDark: {
        dark: true,
        colors: {
          primary: '#5DB0A8',
          secondary: '#2C3E50',
          accent: '#FF8A80',
          error: '#CF6679',
          info: '#2196F3',
          success: '#66BB6A',
          warning: '#FFA726',
          background: '#1A1A2E',
          surface: '#1F2937',
        },
      },
    },
  },
})
