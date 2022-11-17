export default class Utility {
  static colors = {
    red: 0xff0000,
    blue: 0x00ffff,
  }

  static createFields(...fields) {
    let fieldsString = '';

    fields.forEach((element) => {
      fieldsString += `**${element.name}**\n${element.value}\n`
    })

    return fieldsString;
  }
}