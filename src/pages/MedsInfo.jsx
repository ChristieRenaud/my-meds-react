import React, { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "../firebase"
import { useNavigate } from "react-router-dom"
import { onValue, ref, push, remove, set } from "firebase/database"

export default function MedsInfo() {
  const [medications, setMedications] = useState([])
  const [formName, setFormName] = useState("")
  const [formAmt, setFormAmt] = useState("")
  // const [userId, setUserId] = useState("")
  // const [userInDB, setUserInDB] = useState("")
  const navigate = useNavigate()
  const [error, setError] = useState("")

  // const renderMedicationList = medications.map((itemValue) => (
  //   <li className="list-item" key={itemValue.id} id={itemValue.id}>
  //     <span>
  //       {itemValue.name}, {itemValue.amt}
  //     </span>
  //     <FontAwesomeIcon icon={faCircleXmark} className="fa-circle-xmark" />
  //   </li>
  //   // {/* <p className="list-info">itemValue.info</p> */}
  // ))

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid
        const userInDB = ref(database, `users/${userId}`)

        onValue(userInDB, (snapshot) => {
          setMedications(() => [])
          console.log("useEffect ran")
          if (snapshot.exists()) {
            snapshot.forEach((item) => {
              if (item.key !== "userId") {
                setMedications((medications) => [
                  ...medications,
                  {
                    medId: item.key,
                    medName: item.val().name,
                    medAmt: item.val().amt,
                  },
                ])
              }
            })
            console.log(medications)
          }
        })
      }
    })
  }, [])

  // useEffect(() => {   // onAuthStateChanged(auth, (user) => {
  //   //   if (!user) {
  //   //     navigate(`/`)
  //   //   } else {
  //   //     setUserId(() => auth.currentUser.uid)
  //   //     console.log(userId)
  //   //   }
  //   // })}, [])

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/")
        console.log("Signed out successfully")
      })
      .catch((error) => {
        console.log(error.message)
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

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid
        const userInDB = ref(database, `users/${userId}`)
        if (formAmt && formName) {
          setMedications(() => [])
          push(userInDB, {
            name: formName,
            amt: formAmt,
            info: "a drug",
          })

          setFormAmt(() => "")
          setFormName(() => "")
          console.log(formName, formAmt)
        } else {
          setError(() => "Please fill in both fields")
        }
      }
    })
  }

  const handleDelete = (e) => {
    const itemId = e.currentTarget.parentElement.id
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid
        let exactLocationOfItemInDB = ref(database, `users/${userId}/${itemId}`)
        remove(exactLocationOfItemInDB)
        console.log(itemId, "removed")
      }
    })
  }

  return (
    <div>
      <div className="meds-list">
        <h2 className="subhead">Medicines</h2>
        <ul className="list-items" id="meds-list-items">
          {medications.map((itemValue) => (
            <li
              className="list-item"
              key={itemValue.medId}
              id={itemValue.medId}
            >
              <span>
                {itemValue.medName}, {itemValue.medAmt}
              </span>
              <FontAwesomeIcon icon={faCircleXmark} onClick={handleDelete} />
            </li>
            // {/* <p className="list-info">itemValue.info</p> */}
          ))}
        </ul>
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
