enum RuleValue {
  UPPERCASE = '[A-Z]',
  LOWERCASE = '[a-z]',
  NUMBER = '[0-9]',
  SPECIAL_CHARACTER = '^(?=.*[!@#$%^&*_-])[A-Za-z0-9!@#$%^&*_-]+$',
}

export default RuleValue;
