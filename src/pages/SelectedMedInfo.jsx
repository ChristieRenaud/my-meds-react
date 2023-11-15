import { useState, useEffect } from "react"
import Error from "../components/Error"
import { useLocation, useNavigate } from "react-router-dom"
import { nanoid } from "nanoid"
import { auth, database } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { onValue, ref, update } from "firebase/database"
import { Oval } from "react-loader-spinner"

export default function SelectedMedInfo() {
  const location = useLocation()
  const navigate = useNavigate()

  const [medLabel, setMedLabel] = useState({})
  const [loading, setLoading] = useState(true)
  const [infoIsInDatabase, setInfoIsInDatabase] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const user = auth.currentUser
  const userId = user.uid
  const med = location.state.item[0]

  useEffect(() => {
    setLoading(true)
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid
        // Check if label info is already in database, if so save to medLabel
        onValue(ref(database, `users/${uid}/${med.medId}`), (snapshot) => {
          if (snapshot.val().info) {
            setInfoIsInDatabase(true)
            setMedLabel(snapshot.val().info)
            setLoading(false)
          } else {
            // if not, fetch it from api and update the medLabel state
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
              .then(() => setLoading(false))
              .catch((error) => {
                setLoading(false)
                setErrorMessage("Sorry, no label information found.")
              })
          }
        })
      } else {
        console.log("user logged out")
      }
    })
  }, [])

  // if there is info in medLabel state but not in database, update database
  useEffect(() => {
    if (!infoIsInDatabase && Object.entries(medLabel).length !== 0) {
      update(ref(database, `users/${userId}/${med.medId}`), {
        info: medLabel,
      })
    }
  }, [medLabel])

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
      {loading && (
        <div className="loader">
          <Oval
            height={80}
            width={80}
            color="#25436c"
            visible={true}
            secondaryColor="#25436c"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      )}
      {errorMessage && (
        <div>
          <Error errorMessage={errorMessage} />
        </div>
      )}
      <div>{medLabelElements}</div>
    </div>
  )
}
