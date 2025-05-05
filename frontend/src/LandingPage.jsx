import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className='flex gap-4'>
        <Link to='/AdminSignUp'>admin</Link>
        <Link to='/SignUp'>Client</Link>
    </div>
  )
}

export default LandingPage