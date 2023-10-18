import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { nanoid } from "nanoid"
import { auth, database } from "../firebase"

export default function SelectedMedInfo() {
  const [medLabel, setMedLabel] = useState({})
  const location = useLocation()

  const med = location.state.item
  useEffect(() => {
    fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${med.medName.toLowerCase()}`
    )
      .then((data) => data.json())
      .then((data) =>
        setMedLabel({
          label: data.results[0], // returns an object
        })
      )
  }, [])
  const medLabelElements = Object.entries(medLabel.label).map(
    ([key, value]) => {
      return <p key={nanoid()}>{`${key}: ${value}`}</p>
    }
  )

  return (
    <div>
      <p>{med.medName} Information</p>
      {/* <p>{`Active Ingredients: ${medLabel.label.active_ingredient}`}</p> */}
      {medLabelElements}
    </div>
  )
}
