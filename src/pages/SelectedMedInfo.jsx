import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { nanoid } from "nanoid"
import { auth, database } from "../firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { onValue, ref, push, remove, update } from "firebase/database"

export default function SelectedMedInfo() {
  const [medLabel, setMedLabel] = useState({})
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const [infoIsInDatabase, setInfoIsInDatabase] = useState(false)
  const user = auth.currentUser
  const userId = user.uid
  const med = location.state.item[0]

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid
        console.log(uid)
        onValue(ref(database, `users/${uid}/${med.medId}`), (snapshot) => {
          if (snapshot.val().info) {
            setInfoIsInDatabase(true)
            setMedLabel(snapshot.val().info)
          } else {
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
                  activeIngredients:
                    data.results[0].active_ingredient || "none",
                  indicationsAndUsage:
                    data.results[0].indications_and_usage || "none",
                  dosageAndAdministration:
                    data.results[0].dosage_and_administration || "none",
                  warnings: data.results[0].warnings || "none",
                })
              )
              .catch((error) => {
                console.log(error.message)
                setError(true)
              })
          }
        })
      } else {
        console.log("user logged out")
      }
    })
  }, [])

  useEffect(() => {
    if (!infoIsInDatabase && Object.entries(medLabel).length !== 0) {
      update(ref(database, `users/${userId}/${med.medId}`), {
        info: medLabel,
      })
    }
  }, [medLabel])

  function ErrorMessage() {
    return (
      <div className="error">
        <p>Sorry, no label information found.</p>
      </div>
    )
  }
  const medLabelElements = Object.values(medLabel)
    .filter((field) => field !== "none")
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
