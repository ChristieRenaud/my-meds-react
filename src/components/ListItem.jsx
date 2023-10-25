import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { NavLink } from "react-router-dom"

export default function ListItem(props) {
  return (
    <li
      key={props.item.medId}
      className="list-item meds-list-item"
      id={props.item.medId}
    >
      <span>
        <NavLink
          to={`${props.item.medName}`}
          className="link"
          state={{ item: props.item }}
        >
          {props.item.medName}, {props.item.medAmt}
        </NavLink>
      </span>
      <span>
        <FontAwesomeIcon
          icon={faCircleXmark}
          onClick={(e) => props.handleDelete(e)}
        />
      </span>
    </li>
  )
}
