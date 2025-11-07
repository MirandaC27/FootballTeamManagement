//calendar authorization
export async function checkLoggedUser() {
        try {
          let response = await fetch('/loggedUser');
          let user = await response.json();

          if (!user || typeof user !== 'object' || !user.role) {
            user = null;
          }

          const signInButton = document.getElementById('signin-btn');
          const accountDropdown = document.getElementById('account-dropdown');

          const showFormButton = document.getElementById('show-add-form');
          const formStatus = document.getElementById('form-status');
          const adminMenu = document.getElementById('admin');

              // Reset all to hidden/safe defaults
          if (signInButton) signInButton.style.display = 'block';
          if (accountDropdown) accountDropdown.style.display = 'none';
          if (showFormButton) showFormButton.style.display = 'none';
          if (formStatus) formStatus.textContent = '';

          if (user && user.role) {

            if(signInButton)signInButton.style.display = 'none';
            if(accountDropdown) accountDropdown.style.display='block';
            if(adminMenu) adminMenu.style.display = (user.role === 'admin') ? 'block' : 'none';

            if (user.role === 'admin' && showFormButton) {
                showFormButton.style.display = 'inline-block';

            } else if(formStatus){
                if (formStatus) formStatus.textContent = "You must be an admin to add or delete a event.";
            }

            else{
              if (signInButton) signInButton.style.display = 'block';
              if (accountDropdown) accountDropdown.style.display = 'none';
              if (showFormButton) showFormButton.style.display = 'none';
              if (formStatus) formStatus.textContent = '';

            }
          }
            
            return user?.role ? user : null;
          }
        catch (err) {
          console.error("Error with logged user", err);
        }
      }
      checkLoggedUser();
