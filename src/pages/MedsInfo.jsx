import { useState, useEffect } from "react"
import Error from "../components/Error"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "../firebase"
import { useNavigate } from "react-router-dom"
import { onValue, ref, push, remove, update } from "firebase/database"
import ListItem from "../components/ListItem"

export default function MedsInfo() {
  const [medications, setMedications] = useState([])
  const [formName, setFormName] = useState("")
  const [formAmt, setFormAmt] = useState("")
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateFormAmt, setUpdateFormAmt] = useState("")
  const [updateFormNotes, setUpdateFormNotes] = useState("")
  const [currentItemInfo, setCurrentItemInfo] = useState({})

  const navigate = useNavigate()
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

  /* Event handlers */

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

  const handleUpdateFormNotesChange = (e) => {
    console.log(e.target.value)
    setUpdateFormNotes(e.target.value || currentItemInfo.Notes)
  }

  const handleUpdateFormAmtChange = (e) => {
    console.log(updateFormAmt)
    setUpdateFormAmt(e.target.value || currentItemInfo.Amt)
  }

  const handleUpdateFormCancel = (e) => {
    setUpdateOpen(false)
    setUpdateFormAmt("")
    setUpdateFormNotes("")
    setMessage(null)
  }

  const handleUpdateFormSubmit = (e) => {
    e.preventDefault()
    setMessage("")
    const userId = user.uid
    if (updateFormAmt && currentItemInfo.medAmt !== updateFormAmt) {
      update(ref(database, `users/${userId}/${currentItemInfo.medId}`), {
        amt: updateFormAmt,
      })
    }
    if (updateFormNotes && currentItemInfo.medNotes !== updateFormNotes) {
      update(ref(database, `users/${userId}/${currentItemInfo.medId}`), {
        notes: updateFormNotes,
      })
    }
    setUpdateOpen(false)
    setUpdateFormAmt("")
    setUpdateFormNotes("")
  }

  function checkInput(input) {
    const regex = /[\w\s]/
    return regex.test(input)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    const userId = user.uid
    const userInDB = ref(database, `users/${userId}`)

    if (formAmt && formName) {
      if (checkInput(formAmt) && checkInput(formName)) {
        setMedications(() => [])
        push(userInDB, {
          name: formName.trim(),
          amt: formAmt.trim(),
        })
        setFormAmt(() => "")
        setFormName(() => "")
      } else {
        setError("Only letters and numbers may be entered")
        !checkInput(formName) ? setFormName(() => "") : null
        !checkInput(formAmt) ? setFormAmt(() => "") : null
      }
    } else {
      setError(() => "Please fill in both fields")
    }
  }

  const handleDelete = (e) => {
    if (window.confirm("Are you sure you wish to delete this item?")) {
      const itemId = e.currentTarget.parentElement.id
      const userId = user.uid
      let exactLocationOfItemInDB = ref(database, `users/${userId}/${itemId}`)
      remove(exactLocationOfItemInDB)
    }
  }

  const showUpdateForm = (e, medItem) => {
    setUpdateOpen(true)
    setCurrentItemInfo(() => ({
      medName: medItem.medName,
      medId: medItem.medId,
      medAmt: medItem.medAmt,
      medNotes: medItem.medNotes,
    }))
  }

  return (
    <div>
      <div className="meds-list">
        <h3 className="subhead">
          {user.displayName && `${user.displayName}'s`} Medicines
        </h3>
        {/* Update Database Form */}
        {updateOpen && (
          <form className="form form-update">
            <h3>{`Update ${currentItemInfo.medName}`}</h3>
            <label className="med-name" htmlFor="med-name">
              Dosage
            </label>
            <input
              className="med-name input"
              id="med-name"
              type="text"
              required={true}
              defaultValue={currentItemInfo.medAmt}
              onChange={handleUpdateFormAmtChange}
            />
            <label className="med-notes" htmlFor="med-notes">
              Notes
            </label>
            <textarea
              className="med-notes input"
              id="med-notes"
              name="med-notes"
              defaultValue={currentItemInfo.medNotes}
              onChange={handleUpdateFormNotesChange}
              rows="10"
              cols="5"
            ></textarea>
            {message && <Error errorMessage={message} />}
            <div className="update-bns" display="flex">
              <button
                className="btn btn-form btn-update"
                id="update-button"
                onClick={handleUpdateFormSubmit}
              >
                Submit
              </button>
              <button
                className="btn btn-form btn-update"
                id="cancel-button"
                onClick={handleUpdateFormCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
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
      {/* Add Medicine to Database Form */}
      <form
        className={`form ${updateOpen ? "form-disabled" : null}`}
        onSubmit={handleSubmit}
      >
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
          Dosage
        </label>
        <input
          className="med-amt input"
          id="med-amt"
          type="text"
          value={formAmt}
          onChange={handleAmtChange}
        />
        {error && <Error errorMessage={error} />}
        <button className="btn btn-form" id="add-button">
          Submit
        </button>
      </form>
      <button onClick={handleLogout} className="btn btn-signout">
        Sign Out
      </button>
    </div>
  )
}
