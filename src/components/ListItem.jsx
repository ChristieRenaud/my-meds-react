import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons"

export default function ListItem(props) {
  return (
    <li
      key={props.item.medId}
      className="list-item meds-list-item"
      id={props.item.medId}
    >
      <span>
        {props.item.medName}, {props.item.medAmt}
      </span>
      <FontAwesomeIcon
        icon={faCircleXmark}
        onClick={(e) => props.handleDelete(e)}
      />
    </li>
  )
}
