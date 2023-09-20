import React, { useState, useEffect, useRef } from 'react'
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Group,
  Text,
  Transformer,
} from 'react-konva'
import './CinemaHall.css'

const CinemaHall = () => {
  const [seats, setSeats] = useState([])
  const [newSeats, setNewSeats] = useState([])
  const myDataRef = useRef('0')
  const [rows, setRows] = useState(10)
  const [seatsPerRow, setSeatsPerRow] = useState(10)
  const [selectedSeatIds, setSelectedSeatIds] = useState([])
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  })
  console.log(selectedSeatIds)

  useEffect(() => {
    generateSeats()
  }, [rows, seatsPerRow])

  // const handleSeatClick = (place, e) => {
  //   if (myDataRef.current === '0') return

  //   const clickedSeatId = place.id

  //   if (e.evt.shiftKey) {
  //     // If Shift key is pressed, toggle selection of clicked seat
  //     setSelectedSeatIds((prevSelectedSeatIds) => {
  //       if (prevSelectedSeatIds.includes(clickedSeatId)) {
  //         // Deselect the seat if it was previously selected
  //         return prevSelectedSeatIds.filter((id) => id !== clickedSeatId)
  //       } else {
  //         // Select the seat if it was not previously selected
  //         return [...prevSelectedSeatIds, clickedSeatId]
  //       }
  //     })
  //   } else {
  //     // If Shift key is not pressed, select only the clicked seat
  //     setSelectedSeatIds([clickedSeatId])
  //   }
  // }

  const handleSeatClick = (place) => {
    if (myDataRef.current === '0') return
    if (newSeats.length >= 1) {
      const indexToReplace = newSeats.findIndex((data) => data.id === place.id)
      if (indexToReplace !== -1) {
        const updatedSelectedSeats = [...newSeats]
        updatedSelectedSeats[indexToReplace] = {
          ...place,
          price: myDataRef.current,
        }
        setSeats(updatedSelectedSeats)
        return setNewSeats(updatedSelectedSeats)
      }
    } else {
      const indexToReplace = seats.findIndex((data) => data.id === place.id)
      if (indexToReplace !== -1) {
        const updatedSelectedSeats = [...seats]
        updatedSelectedSeats[indexToReplace] = {
          ...place,
          price: myDataRef.current,
        }
        setSeats(updatedSelectedSeats)
        return setNewSeats(updatedSelectedSeats)
      }
    }
  }

  const handleDragEnd = (e, place) => {
    const deltaX = e.target.x() - parseFloat(place.rect.x)
    const deltaY = e.target.y() - parseFloat(place.rect.y)

    const newX = Math.round(parseFloat(place.rect.x) + deltaX)
    const newY = Math.round(parseFloat(place.rect.y) + deltaY)

    const updatedSeats = seats.map((seat) => {
      if (seat.id === place.id) {
        return {
          ...seat,
          rect: {
            x: newX.toString(),
            y: newY.toString(),
          },
        }
      }
      return seat
    })

    setNewSeats(updatedSeats)
  }

  const seatWidth = 30
  const seatHeight = 30

  const generateSeats = () => {
    const newSeats = []
    const padding = 5

    for (let row = 0; row < rows; row++) {
      for (let place = 0; place < seatsPerRow; place++) {
        const x = place * (seatWidth + padding)
        const y = row * (seatHeight + padding)
        const id = `place_${row + 1}_${place + 1}`
        const price = '0'
        const rect = {
          x: x.toString(),
          y: y.toString(),
        }

        newSeats.push({
          id,
          row: row + 1,
          place: place + 1,
          price,
          rect,
        })
      }
    }

    setSeats(newSeats)
  }

  const onMouseDown = (e) => {
    console.log('Down')
    const isSeat = e.target.getParent().getType() === 'Group'

    if (!isSeat) {
      // If the clicked element is not a seat, clear the selection
      setSelectedSeatIds([])
    } else {
      // If a seat is clicked, handle seat selection
      const clickedSeatId = e.target.getParent().getAttr('id')
      const isSeatSelected = selectedSeatIds.includes(clickedSeatId)

      if (e.evt.shiftKey) {
        // If Shift key is pressed, toggle selection of the clicked seat
        setSelectedSeatIds((prevSelectedSeatIds) =>
          isSeatSelected
            ? prevSelectedSeatIds.filter((id) => id !== clickedSeatId)
            : [...prevSelectedSeatIds, clickedSeatId],
        )
      } else {
        // If Shift key is not pressed, select only the clicked seat
        setSelectedSeatIds([clickedSeatId])
      }
    }

    const pos = e.target.getStage().getPointerPosition()
    setSelectionRect({
      visible: true,
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    })
  }

  const onMouseMove = (e) => {
    console.log('Move')
    if (!selectionRect.visible) {
      return
    }

    const pos = e.target.getStage().getPointerPosition()
    console.log(e.target.getStage().getPointerPosition())
    setSelectionRect((prevRect) => ({
      ...prevRect,
      x2: pos.x,
      y2: pos.y,
    }))
  }

  const onMouseUp = () => {
    console.log('Up')
    setSelectionRect((prevRect) => ({
      ...prevRect,
      visible: false,
    }))

    const { x1, x2, y1, y2 } = selectionRect
    const selBox = {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    }

    // Find seats that intersect with the selection box
    const elements = seats.filter((seat) => {
      const seatBox = {
        x: parseFloat(seat.rect.x),
        y: parseFloat(seat.rect.y),
        width: seatWidth,
        height: seatHeight,
      }

      return (
        seatBox.x < selBox.x + selBox.width &&
        seatBox.x + seatBox.width > selBox.x &&
        seatBox.y < selBox.y + selBox.height &&
        seatBox.y + seatBox.height > selBox.y
      )
    })

    // Get the IDs of the selected seats
    const selectedSeatIds = elements.map((element) => element.id)

    setSelectedSeatIds(selectedSeatIds)
  }

  return (
    <div>
      <h1>Cinema Hall Diagram</h1>
      <div className="wrapper">
        <div>
          <div>
            <label htmlFor="rows">Rows: </label>
            <input
              type="number"
              id="rows"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="seats">Seats per row: </label>
            <input
              type="number"
              id="seats"
              value={seatsPerRow}
              onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}
              min="1"
            />
          </div>
        </div>
        <div className="wrapper__btn">
          <div>
            <span className="btn__colorBlue"></span>
            <button onClick={() => (myDataRef.current = '200')}>200</button>
          </div>
          <div>
            <span className="btn__colorRed"></span>
            <button onClick={() => (myDataRef.current = '300')}>300</button>
          </div>
          <div>
            <span className="btn__colorOrange"></span>
            <button onClick={() => (myDataRef.current = '400')}>400</button>
          </div>
        </div>
      </div>
      <div id="pixi-container">
        <Stage
          width={800}
          height={400}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          <Layer>
            <Rect width={800} height={400} fill="gray" />
            {seats.map((seat) => (
              <Group
                key={seat.id}
                draggable
                onClick={(e) => handleSeatClick(seat, e)}
                onDragEnd={(e) => handleDragEnd(e, seat)}
                onTap={(e) => handleSeatClick(seat, e)}
              >
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
            ))}
            {seats.map((selectedSeat) => (
              <Transformer
                key={`transformer_${selectedSeat.id}`}
                anchorSize={8}
                borderEnabled={false}
                rotateEnabled={false}
                x={parseFloat(selectedSeat.rect.x)}
                y={parseFloat(selectedSeat.rect.y)}
                width={seatWidth}
                height={seatHeight}
                enabled={selectedSeatIds.includes(selectedSeat.id)}
              />
            ))}
            <Rect
              x={selectionRect.x1}
              y={selectionRect.y1}
              width={selectionRect.x2 - selectionRect.x1}
              height={selectionRect.y2 - selectionRect.y1}
              fill="rgba(0, 161, 255, 0.3)"
            />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default CinemaHall
