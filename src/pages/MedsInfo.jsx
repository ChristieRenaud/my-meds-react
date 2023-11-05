import { useState, useEffect } from "react"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "../firebase"
import { useNavigate } from "react-router-dom"
import { onValue, ref, push, remove, set } from "firebase/database"
import ListItem from "../components/ListItem"

export default function MedsInfo() {
  const [medications, setMedications] = useState([])
  const [formName, setFormName] = useState("")
  const [formAmt, setFormAmt] = useState("")
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [updateOpen, setUpdateOpen] = useState([false, ""])
  const [updateFormAmt, setUpdateFormAmt] = useState("")
  const [updateFormNotes, setUpdateFormNotes] = useState("")
  const user = auth.currentUser
  console.log(user)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid
        const userInDB = ref(database, `users/${userId}`)

        onValue(userInDB, (snapshot) => {
          setMedications(() => [])
          if (snapshot.exists()) {
            snapshot.forEach((item) => {
              if (item.key !== "userId") {
                setMedications((medications) => [
                  ...medications,
                  {
                    medId: item.key,
                    medName: item.val().name,
                    medAmt: item.val().amt,
                    medNotes: item.val().notes || "",
                  },
                ])
              }
            })
          }
        })
      }
    })
  }, [])

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/")
        console.log("Signed out successfully")
      })
      .catch((error) => {
        console.log(error.message)
        setError(() => "Error signing out.")
      })
  }

  const handleNameChange = (e) => {
    setFormName(e.target.value)
  }

  const handleAmtChange = (e) => {
    setFormAmt(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    const userId = user.uid
    const userInDB = ref(database, `users/${userId}`)
    if (formAmt && formName) {
      setMedications(() => [])
      push(userInDB, {
        name: formName,
        amt: formAmt,
      })

      setFormAmt(() => "")
      setFormName(() => "")
    } else {
      setError(() => "Please fill in both fields")
    }
  }

  const handleDelete = (e) => {
    console.log(e.currentTarget.parentElement.id)
    const itemId = e.currentTarget.parentElement.id
    const userId = user.uid
    let exactLocationOfItemInDB = ref(database, `users/${userId}/${itemId}`)
    remove(exactLocationOfItemInDB)
  }

  const showUpdateForm = (e, medName) => {
    const medId = e.currentTarget.parentElement
    console.log(updateOpen[0])
    console.log(medName)
    setUpdateOpen((array) => [!array[0], medName, medId])
  }
  return (
    <div>
      <div className="meds-list">
        <h3 className="subhead">
          {user.displayName && `${user.displayName}'s`} Medicines
        </h3>
        {updateOpen[0] && <p>Update Form</p>}
        <dl className="list-items" id="meds-list-items">
          {medications.map((item) => (
            <ListItem
              key={item.medId}
              handleDelete={handleDelete}
              showUpdateForm={showUpdateForm}
              item={item}
            />
          ))}
        </dl>
      </div>
      <form className="form">
        <label className="med-name" htmlFor="med-name">
          Drug Name
        </label>
        <input
          className="med-name input"
          id="med-name"
          type="text"
          value={formName}
          onChange={handleNameChange}
        />
        <label className="med-amt" htmlFor="med-amt">
          Amount
        </label>
        <input
          className="med-amt input"
          id="med-amt"
          type="text"
          value={formAmt}
          onChange={handleAmtChange}
        />
        {error && <p className="error-message">{error}</p>}
        <button className="btn btn-form" id="add-button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
      <button onClick={handleLogout} className="btn btn-signout">
        Sign Out
      </button>
    </div>
  )
}
