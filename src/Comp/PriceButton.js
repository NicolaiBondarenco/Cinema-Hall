import React from 'react'

const PriceButtons = ({ color, price, handlePrice }) => {
  return (
    <div>
      <span className={`btn__${color}`}></span>
      <button onClick={() => handlePrice(price)}>{price}</button>
    </div>
  )
}

export default PriceButtons
