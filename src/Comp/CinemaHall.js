import React, { useState, useEffect, useRef } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import PriceButton from './PriceButton'
import Seat from './Seat'
import SeatTransformer from './SeatTransformer'
import './CinemaHall.css'
import schema from '../schema.json'

const CinemaHall = () => {
  const [seats, setSeats] = useState()
  const [newSeats, setNewSeats] = useState()
  const myDataRef = useRef('0')
  const [rows, setRows] = useState(10)
  const [seatsPerRow, setSeatsPerRow] = useState(10)
  const [name, setName] = useState('')
  const [selectedSeatIds, setSelectedSeatIds] = useState([])
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  })

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

  const generateSeats = (e) => {
    e.preventDefault()
    if (!name || isNaN(rows) || isNaN(seatsPerRow)) {
      return null
    }

    const newSeats = {
      [name]: {
        id: Math.floor(Math.random() * 1000), // You can generate a unique ID here
        places: [],
      },
    }

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

        newSeats[name].places.push({
          id,
          row: row + 1,
          place: place + 1,
          price,
          rect,
        })
      }
    }

    // Now, newSeats is an object containing the sector name and its associated places
    setSeats(newSeats)
  }

  const onMouseDown = (e) => {
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
    if (!selectionRect.visible) {
      return
    }

    const pos = e.target.getStage().getPointerPosition()
    setSelectionRect((prevRect) => ({
      ...prevRect,
      x2: pos.x,
      y2: pos.y,
    }))
  }

  const onMouseUp = () => {
    setSelectionRect({
      visible: false,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    })

    const { x1, x2, y1, y2 } = selectionRect
    const selBox = {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    }

    // Find objects that intersect with the selection box
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

    // Get the IDs of the selected objects along the perimeter
    const selectedObjectIds = elements.map((element) => element.id)

    setSelectedSeatIds(selectedObjectIds)
  }

  const setPrice = (price) => {
    myDataRef.current = price
  }

  useEffect(() => {
    function setMultiplePrice() {
      setSeats((prevSeats) => {
        return prevSeats?.map((seat) => {
          if (selectedSeatIds.includes(seat.id)) {
            // Update the price of the selected seat
            return {
              ...seat,
              price: myDataRef.current,
            }
          } else {
            return seat
          }
        })
      })
    }

    setMultiplePrice()
  }, [selectedSeatIds])

  return (
    <div>
      <h1>Cinema Hall Diagram</h1>
      <div className="wrapper">
        <form className="form">
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
            <label htmlFor="seats">Seats: </label>
            <input
              type="number"
              id="seats"
              value={seatsPerRow}
              onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}
              min="1"
            />
          </div>
          <div>
            <label htmlFor="seats">Name: </label>
            <input
              type="text"
              id="seats"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            className="form__btn"
            type="submit"
            onClick={(e) => generateSeats(e)}
          >
            Create
          </button>
        </form>
        <div className="wrapper__btn">
          <PriceButton
            price="200"
            color="colorBlue"
            handlePrice={(price) => setPrice(price)}
          />
          <PriceButton
            price="300"
            color="colorRed"
            handlePrice={(price) => setPrice(price)}
          />
          <PriceButton
            price="400"
            color="colorOrange"
            handlePrice={(price) => setPrice(price)}
          />
        </div>
      </div>
      <div id="pixi-container">
        <Stage
          width={800}
          height={500}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          <Layer>
            <Rect width={800} height={400} fill="gray" />
            {seats &&
              Object.keys(seats).map((item) => {
                const section = seats[item]
                return section.places.map((seat) => (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    onClick={() => handleSeatClick(seat)}
                    onDragEnd={(e) => handleDragEnd(e, seat)}
                    seatWidth={30}
                    seatHeight={30}
                  />
                ))
              })}
            {seats &&
              Object.keys(seats).map((item) => {
                const section = seats[item]
                return section.places.map((selectedSeat) => (
                  <SeatTransformer
                    key={`transformer_${selectedSeat.id}`}
                    seat={selectedSeat}
                    enabled={selectedSeatIds.includes(selectedSeat.id)}
                    seatWidth={30}
                    seatHeight={30}
                  />
                ))
              })}
            {/* {seats?.map((selectedSeat) => (
              <SeatTransformer
                key={`transformer_${selectedSeat.id}`}
                seat={selectedSeat}
                enabled={selectedSeatIds.includes(selectedSeat.id)}
                seatWidth={30}
                seatHeight={30}
              />
            ))} */}
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
