import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { nanoid } from "nanoid"
import { auth, database } from "../firebase"

export default function SelectedMedInfo() {
  const [medLabel, setMedLabel] = useState({})
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  const med = location.state.item
  useEffect(() => {
    fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${med.medName.toLowerCase()}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
      .then((data) =>
        setMedLabel({
          activeIngredients: data.results[0].active_ingredient,
          indicationsAndUsage: data.results[0].indications_and_usage,
          dosageAndAdministration: data.results[0].dosage_and_administration,
          warnings: data.results[0].warnings,
        })
      )
      .catch((error) => {
        console.log(error.message)
        setError(true)
      })
  }, [])

  function ErrorMessage() {
    return (
      <div className="error">
        <p>Sorry, no label information found.</p>
      </div>
    )
  }
  const medLabelElements = Object.values(medLabel)
    .filter((field) => field !== undefined)
    .map((field) => (
      <p key={nanoid()} className="label-info">
        {field}
      </p>
    ))

  return (
    <div>
      <button className="btn-back btn" onClick={() => navigate(-1)}>
        Return to Medication List
      </button>
      <h2 className="subhead">{med.medName} Label Information</h2>
      {error && <ErrorMessage />}
      <div>{medLabelElements}</div>
    </div>
  )
}
