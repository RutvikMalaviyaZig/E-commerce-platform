const calculateAge = (dob) => {
    const [day, month, year] = dob.split('-').map(Number);
  
    const birthDate = new Date(year, month - 1, day);
  
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
  
    if (
      today <
      new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    ) {
      age--;
    }
  
    return age;
  };
  
  module.exports = { calculateAge };
  