import React from 'react'
import { Transformer } from 'react-konva'

const SeatTransformer = ({
  referense,
  seat,
  enabled,
  seatWidth,
  seatHeight,
}) => {
  return (
    <Transformer
      ref={referense}
      anchorSize={8}
      borderEnabled={false}
      rotateEnabled={false}
      x={parseFloat(seat.rect.x)}
      y={parseFloat(seat.rect.y)}
      width={seatWidth}
      height={seatHeight}
      enabled={enabled}
    />
  )
}

export default SeatTransformer
