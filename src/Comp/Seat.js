import React from 'react'
import { Group, Circle, Text } from 'react-konva'

const Seat = ({ seat, onClick, onDragEnd, seatWidth, seatHeight }) => {
  return (
    <Group draggable onClick={onClick} onDragEnd={onDragEnd} onTap={onClick}>
      <Circle
        id={seat.id}
        x={parseFloat(seat.rect.x) + seatWidth / 2}
        y={parseFloat(seat.rect.y) + seatHeight / 2}
        radius={Math.min(seatWidth, seatHeight) / 5}
        fill={
          seat.price === '200'
            ? 'blue'
            : seat.price === '300'
            ? 'tomato'
            : seat.price === '400'
            ? 'orange'
            : 'white'
        }
      />
      <Text
        x={
          seat.place > 9
            ? parseFloat(seat.rect.x) + seatWidth / 2 - 6
            : parseFloat(seat.rect.x) + seatWidth / 2 - 3
        }
        y={parseFloat(seat.rect.y) + seatHeight / 2 - 4}
        text={seat.place.toString()}
        fontSize={9}
        fill="black"
      />
    </Group>
  )
}

export default Seat
