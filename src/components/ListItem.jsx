import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { faPen } from "@fortawesome/free-solid-svg-icons"
import { NavLink } from "react-router-dom"

export default function ListItem(props) {
  return (
    <div key={props.item.medId} className="list-item meds-list-item">
      <dt id={props.item.medId}>
        <span>
          <NavLink
            to={`${props.item.medName}`}
            className="link"
            state={{ item: [props.item] }}
          >
            {props.item.medName}, {props.item.medAmt}
          </NavLink>
        </span>
        <FontAwesomeIcon
          icon={faCircleXmark}
          onClick={(e) => props.handleDelete(e)}
        />
        <FontAwesomeIcon
          icon={faPen}
          onClick={(e) => props.showUpdateForm(e, props.item.medName)}
        />
      </dt>
      {props.item.medNotes != "" ? (
        <dd className="list-definition">
          <p className="notes-heading">Notes</p>
          <p>{props.item.medNotes}</p>
        </dd>
      ) : null}
    </div>
  )
}
