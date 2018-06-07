exports.emailValidation = function(email) {

        if (email) {
            let re = /^[a-z0-9](\.?[a-z0-9_-]){0,}@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/;
            let trimmedEmail = email.trim();

            if (!re.test(trimmedEmail) || trimmedEmail.length === 0) {
                return false;
            }
            
            return true;
        } else {
            return false;
        }
  }