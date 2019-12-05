const datetimeToDate = datetime => {
  const regDate = datetime.match(
    /([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/
  )
  if (regDate === null) return false
  return `${regDate[1]}/${regDate[2]}/${regDate[3]} ${regDate[4]}:${regDate[5]}:${regDate[6]}`
}

export default {
  datetimeToDate
}
