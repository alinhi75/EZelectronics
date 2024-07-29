# Requirements Document - future EZElectronics

Date:

Version: V1 - description of EZElectronics in FUTURE form (as proposed by the team)

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - future EZElectronics](#requirements-document---future-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| User             | Entity that interact with the system and has one of two role           |
| Manager          | One of the user roles, manager products and act as admin            |
| Customer         | One of the user roles, can by product and manage his cart           |
| Developer        | Develop the web application            |
| Tester           | Test the feature and the DB           |
| Business Owner   | Owner of the company and the one how commissioned the software           |
| Payment System   | External system that handle the payment           |

# Context Diagram and interfaces

## Context Diagram

![Context Diagram V2](./img/Context-DiagramV2.png)

## Interfaces

|   Actor   | Physical Interface | Logical Interface  |
| :-------  | :---------------:  | :----------------: |
| User      | PC, Smartphone     | GUI (Log in/Log out + common section)   |
| -- Manager   | PC, Smartphone     | GUI (Manage accounts and products)   |
| -- Customer  | PC, Smartphone     | GUI (Customer section)|
| Developer | PC                 | GUI (Develop the application) |
| Tester    | PC                 | GUI (Test the application) + command line |
| Payment System    | Internet link  | <https://developer.visa.com/docs>   |

# Stories and personas

**1.Mark Thompson - Electronics Store Manager** \
Age: 35 \
Background: Mark has been working as a manager at an electronics store for the past 5 years. He is responsible for overseeing the store's operations, managing inventory, and ensuring customer satisfaction. \
Goals: Mark wants to streamline the process of managing products, recording new arrivals, and tracking sales to improve efficiency and profitability.

**2.Emily Rodriguez - Regular Customer**
Age: 28 \
Background: Emily is a tech enthusiast who frequently shops for electronics online. She values convenience and looks for a user-friendly shopping experience. \
Goals: Emily wants to easily browse through available products, add items to her cart, and track her purchase history for future reference. \

### User Stories

**1.As a store manager** \
I want to be able to log in to the EZElectronics application, so that I can access the management features and functionalities.
Acceptance Criteria: \
1.The login page should require a username/email and password for authentication. \
2.Successful login should redirect the user to the dashboard or main management page. \
**2.As a regular customer** \
I want to view all available products on the EZElectronics website, so that I can browse and make purchase decisions. \
Acceptance Criteria: \
1.The homepage should display a list of all available products with details such as name, price, and image. \
2.Each product should have a button or link to view more details and add it to the cart. \
**3.As a store manager** \
I want to be able to create a new product entry in the EZElectronics application, so that I can add newly arrived items to the inventory. \
Acceptance Criteria: \
1.The product creation form should include fields for name, category, price, quantity, and arrival date. \
2.Upon submission, the system should validate the input and add the new product to the database. \
**4.As a regular customer** \
I want to be able to add products to my shopping cart on the EZElectronics website, so that I can proceed to checkout and make a purchase. \
Acceptance Criteria: \
1.Each product listing should have an "Add to Cart" button. \
2.Upon clicking the button, the selected product should be added to the user's cart, and the cart icon should update to reflect the added item. \
**5.As a Store Manager** \
I want to retrieve a list of all users in the EZElectronics application, so that I can manage user accounts and permissions. \
Acceptance Criteria: \
1.The system should provide an option to view all registered users. \
2.The user list should include details such as username, email, role, and registration date. \

# Functional and non functional requirements

## Functional Requirements

|  ID       | Description                   |
| :---      | :---------                    |
|  FR1      | Authentication                |
|  -- FR1.0  | Log in                        |
|  -- FR1.1  | Log out with the logged-in user |
|  -- FR1.2  | Retrieve user information and credentials |
|  -- FR1.3  | Create user |
|  -- FR1.4  | Send verification code in case user forgets his password |
|  FR2      | User Management               |
|  -- FR2.0  | Retrieve users list or a user with specific attributes (username, role) |
|  -- FR2.1  | Delete a specific user by username |
|  -- FR2.2  | Edit profile and info for a specific user |
|  -- FR2.3  | Delete all users from the database (for testing purposes) |
|  FR3      | Product Management            |
|  -- FR3.0  | Create a new product with valid parameters |
|  -- FR3.1  | Register the arrival of a set of products with valid parameters |
|  -- FR3.2  | Mark a product as sold after validation checks |
|  -- FR3.3  | Edit the information for a specific product |
|  -- FR3.4  | Add image for a specific product |
|  -- FR3.5  | Manage product reviews (retrive and add) |
|  FR4      | Product Retrieval             |
|  -- FR4.0  | Retrieve all products from the database |
|  -- FR4.1  | Retrieve unsold products from the database |
|  -- FR4.2  | Retrieve sold products from the database |
|  -- FR4.3  | Retrieve a specific product by username |
|  -- FR4.4  | Retrieve products of a specific category |
|  -- FR4.5  | Retrieve products of a specific model |
|  -- FR4.6  | Retrive suggestions of similar products|
|  FR5      | Cart Management                |
|  -- FR5.0  | Return the current cart of the logged-in user |
|  -- FR5.1  | Add a specific product to the cart |
|  -- FR5.2  | Remove a specific product from the cart |
|  -- FR5.3  | Delete the entire current cart for a user |
|  -- FR5.4  | Delete all existing carts from the database (for testing purposes) |
|  -- FR5.5  | Allow for payment of the cart if it's not empty |
|  -- FR5.6  | Record and provide the history of carts for a user |
|  FR6      | Manage payments             |
|  -- FR6.0  | Require payment (ask name, surname, credit card details)|
|  -- FR6.1  | Manage payment information with  payment service (link to payment circuit system for verification... )|
|  -- FR6.2  | Add payment method |

## Non Functional Requirements

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1     |Efficiency | "The system should respond to user interactions within a maximum of 2 seconds under normal operating conditions. | All FR |
| NFR2       |Usability | "The user interface should be intuitive and easy to navigate, requiring no more than 10 minutes of training for new users to perform common tasks such as adding products to the cart, viewing purchase history, search for specific product, category and creating new product" | All FR|
| NFR3    |Portability | "The system should be implemented as a web application, and has to be accessible from any modern web browser on desktop (from Windows 7, Ubuntu 16) and mobile devices (from IOS 14, Android 9), including Chrome, Firefox, Safari, and Edge." | All FR |
| NFR3       |Security |"All sensitive data, including customer information and payment details, should be encrypted using industry-standard encryption algorithms such as AES-256 both during transmission over the network and while stored in the database. Access to administrative functions should be restricted to specific portal for admins and password policies requiring a minimum length of 8 characters, including a mix of alphanumeric characters and symbols and capital alphabet."| Authentication, Payment|

# Use case diagram and use cases

## Use case diagram

![Use Case Diagram V2](./img/UseCaseDiagramV2.png)

## Use cases

### UC1: User Login

| Actors Involved  |  User                                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | None                                                                 |
|  Post condition  | user is successfully logged in                                       |
| Nominal Scenario | sc1.1(a user is logged in)                                           |
|     Variants     |                                                                      |
|    Exceptions    | sc1.2(the user doesn't exist), sc1.3(the user insert a wrong password)|

#### Scenario 1.1 (a user is logged in)

|  Scenario 1.1   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |                   The user is not currently logged in                      |
| Post condition  |                   The user is successfully logged in.                      |
|     Step#       |                                Description                                 |
|       1         |**User** navigates to the login page of the application                     |
|       2         |**User** enters their username/email into the designated field.             |
|       3         |**User** enters their password into the password field.                     |
|       4         |**User** clicks on the "Login" button.                                      |
|       5         |**system** verifies the provided credentials against the stored user data.  |
|       6         |**system** If the credentials are valid,grants access and logs the user into their account.|
|       7         |**system** displays a confirmation message indicating successful login.     |

#### Scenario 1.2 (the user doesn't exist)

|  Scenario 1.2   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |                   The user is not currently logged in.                     |
| Post condition  |The user is not logged in, and an error message is displayed indicating the user doesn't exist.|
|     Step#       |                                Description                                 |
|       1         |**User** navigates to the login page of the application.                    |
|       2         |**User** enters their username/email into the designated field.             |
|       3         |**User** enters their password into the password field.                     |
|       4         |**User** clicks on the "Login" button.                                      |
|       5         |**system** verifies the provided credentials against the stored user data.  |
|       6         |**system** If the user doesn't exist in the system, displays an error message.|

#### Scenario 1.3 (incorrect password)

|  Scenario 1.3   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |                   The user is not currently logged in.                     |
| Post condition  |The user is not logged in,and an error message is displayed indicating incorrect password.|
|     Step#       |                                Description                                 |
|       1         |**User** navigates to the login page of the application.                    |
|       2         |**User** enters their username/email into the designated field.             |
|       3         |**User** enters their password into the password field.                     |
|       4         |**User** clicks on the "Login" button.                                      |
|       5         |**system** verifies the provided credentials against the stored user data.  |
|       6         |**system** If the password is incorrect, the system displays an error message for password.|

### UC2: User Logout

| Actors Involved  |  User                                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | The user is logged in                                                |
|  Post condition  | user is successfully logged out                                      |
| Nominal Scenario | sc2.1(a user is logged out)                                          |
|     Variants     |                                                                      |
|    Exceptions    | sc2.2(a user is not logged out)                                      |

#### Scenario 2.1 (a user is logged out)

|  Scenario 2.1   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |                   The user is currently logged in.                         |
| Post condition  |                The user is successfully logged out.                        |
|     Step#       |                                Description                                 |
|       1         |**User** navigates to the logout functionality within the application.      |
|       2         |**User** clicks on the "Logout" button or selects the option to logout.     |
|       3         |**system** confirms the user's intention to logoutand proceeds with the logout process.|
|       4         |**system** terminates the user's session,clearing any active session data.  |
|       5         |**system** redirects the user to the homepage or a designated logout confirmation page.|
|       6         |**system** displays a confirmation message indicating successful logout     |

#### Scenario 2.2 (a user is not logged out)

|  Scenario 2.2   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |        The user remains logged in,and an error message is displayed indicating logout failure.|
|     Step#       |                                Description                                 |
|       1         |**User** attempts to logout from the application                            |
|       2         |**User** clicks on the "Logout" button or selects the option to logout.     |
|       3         |**system** encounters an unexpected error or failure during the logout process.|
|       4         |**system** displays an error message indicating the inability to logout at this time.|

### UC3: Retrieve User Information

| Actors Involved  |  User                                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | The user is logged in                                                |
|  Post condition  | User information is successfully retrieved                           |
| Nominal Scenario | sc3.1(get the user information), sc3.2(get the list of all users)    |
|     Variants     | sc3.3(get users by roles), sc3.4(get user by username)               |
|    Exceptions    | sc3.5(doesn't get the user information), sc3.6(the user doesn't exist), sc3.7(the are no user in DB)|

#### Scenario 3.1 (get the user information)

|  Scenario 3.1   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |        User information is successfully retrieved.                         |
|     Step#       |                                Description                                 |
|       1         |**User** accesses the profile or account settings page within the application.|
|       2         |**system** retrieves the user's information from the database based on their logged-in session.|
|       3         |**system** displays the retrieved user information, such as name, email, and profile picture.|
|       4         |**User** can view and possibly edit their information as allowed by the application's features.|

#### Scenario 3.2 (get the list of all users)

|  Scenario 3.2   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |        The list of all users is successfully retrieved                     |
|     Step#       |                                Description                                 |
|       1         |**User** accesses the administrative section or user management page within the application.|
|       2         |**system** provides an option to retrieve the list of all users.            |
|       3         |**User** triggers the action to retrieve the list of users by clicking on a corresponding button.|
|       4         |**system** retrieves the list of all users from the database.               |
|       5         |**system** displays the list of users, including their names, usernames, and other details.|

#### Scenario 3.3 (get users by roles)

|  Scenario 3.3   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |       The list of users with specific roles is successfully retrieved.     |
|     Step#       |                                Description                                 |
|       1         |**User**accesses the administrative section or user management page within the application.|
|       2         |**system** provides an option to retrieve  users by their roles.            |
|       3         |**User** selects the desired role(s) from a list or input field.            |
|       4         |**User** triggers the action to retrieve users by roles by clicking on a corresponding button.|
|       5         |**system** retrieves the list of users who have the selected roles from the database.|
|       6         |**system** displays the list of users with the specified roles, including their details.|

#### Scenario 3.4 (get user by username)

|  Scenario 3.4   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |       The user with the specified username is successfully retrieved.      |
|     Step#       |                                Description                                 |
|       1         |**User** accesses the search or user lookup functionality within the application.|
|       2         |**User** enters the username of the user they want to retrieve into the search field.|
|       3         |**User** triggers the search by clicking on a search button or pressing Enter.|
|       4         |**system** retrieves the user with the specified username from the database.|
|       5         |**system** displays the user's information, including their name, email, and other details.|

#### Scenario 3.5 (doesn't get the user information)

|  Scenario 3.5   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  | The user information is not retrieved, and an error message is displayed.  |
|     Step#       |                                Description                                 |
|       1         |**User** attempts to retrieve their information,such as accessing the profile page.|
|       2         |**system** encounters an error or failure during the retrieval process.     |
|       3         |**system** displays an error message indicating the inability to retrieve the user information.|

#### Scenario 3.6 (the user doesn't exist)

|  Scenario 3.6   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |       The user does not exist, and an error message is displayed.          |
|     Step#       |                                Description                                 |
|       1         |**User** attempts to retrieve information about a specific user.            |
|       2         |**User** provides the username or identifier of the user they want to retrieve.|
|       3         |**system** searches for the specified user in the database.                 |
|       4         |**system** If the user does not exist,displays an error messageindicating the user's absence.|

#### Scenario 3.7 (the are no user in DB)

|  Scenario 3.7   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is currently logged in.                                    |
| Post condition  |  No users are found in the database, and an error message is displayed.    |
|     Step#       |                                Description                                 |
|       1         |**User** attempts to retrieve a list of users or specific user information. |
|       2         |**system** queries the database to fetch the requested user data.           |
|       3         |**system** If there are no users in the database, displays an error message.|

### UC4: Create New User

| Actors Involved  |  User                                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | none or the user is a manger                                         |
|  Post condition  | New user is created successfully                                     |
| Nominal Scenario | sc4.1(create a new customer account), sc4.2(create a new manager account)|
|     Variants     |                                                                      |
|    Exceptions    | sc4.3(the new user is not created), sc4.4(the user already exists ), sc4.5(no permission to create a manager)|

#### Scenario 4.1 (create a new customer account)

| Scenario 4.1    |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   |        The user is authorized to create new customer accounts or has appropriate permissions.|
| Post condition  |        A new customer account is successfully created.                     |
|     Step#       |                                Description                                 |
|       1         |**User** navigates to the user creation page or account registration section within the application.|
|       2         |**User** fills out the required information for the new customer account, such as name, email, etc.|
|       3         |**User** submits the filled-out form or clicks on a "Create Account" button.|
|       4         |**system** verifies the provided information and checks for any existing accounts with the same details.|
|       5         |**system**If the provided information is valid and unique, creates a new customer account.|
|       6         |**system** displays a confirmation message indicating the successful creation of the new account.|

#### Scenario 4.2 (create a new manager account)

|  Scenario 4.2   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   | The user is authorized to create new manager accounts or has appropriate permissions.|
| Post condition  | A new manager account is successfully created.                             |
|     Step#       |                                Description                                 |
|       1         |**User** accesses the administrative section or user management page within the application.|
|       2         |**User** selects the option to create a new manager account.                |
|       3         |**User** fills out the required information for the new manager account,such as name, email, etc.|
|       4         |**User** submits the filled-out form or clicks on a "Create Account" button |
|       5         |**system** verifies the provided information and checks for any existing accounts with the same details.|
|       6         |**system** If the provided information is valid and unique, the system creates a new manager account.|
|       7         |**system** displays a confirmation message indicating the successful creation of the new manager account.|

#### Scenario 4.3 (the new user is not created)

|  Scenario 4.3   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   | The user is authorized to create new accounts.                             |
| Post condition  | The new user is not created, and an error message is displayed.            |
|     Step#       |                                Description                                 |
|       1         |**User** attempts to create a new user account.                             |
|       2         |**User** fills out the required information for the new manager account,such as name, email, etc.|
|       3         |**User** submits the filled-out form or clicks on a "Create Account" button.|
|       4         |**system** encounters an error or failure during the account creation process.|
|       5         |**system** displays an error message indicating the inability to create the new user account.|

#### Scenario 4.4 (the user already exists)

|  Scenario 4.4   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   | The user is authorized to create new accounts.                             |
| Post condition  | The new user is not created, and an error message is displayed indicating the user already exists.|
|     Step#       |                                Description                                 |
|       1         |**User** attempts to create a new user account.                                 |
|       2         |**User** fills out the required information for the new manager account, such as name, email, etc.|
|       3         |**User** submits the filled-out form or clicks on a "Create Account" button |
|       4         |**system** checks for any existing accounts with the same details as the new account.|
|       5         |**system** If an account with identical details already exists,displays an error message.|

#### Scenario 4.5 (no permission to create a manager)

|  Scenario 4.5   |                                                                            |
| :------------:  | :------------------------------------------------------------------------: |
|  Precondition   | The user is authorized to create new manager accounts.                     |
| Post condition  | The new manager account is not created,and an error message is displayed indicating insufficient permissions.|
|     Step#       |                                Description                                 |
|       1         |**User** attempts to create a new manager account.                          |
|       2         |**User** fills out the required information for the new manager account,such as name, email, etc.|
|       3         |**User** submits the filled-out form or clicks on a "Create Account" button |
|       4         |**system** verifies the user's permissions to create manager accounts.      |
|       5         |**system** If the user does not have sufficient permissions,the system displays an error message.|

### UC5: Delete user

| Actors Involved  | User                                                              |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                    |
|  Post condition  | The specified user/users no longer exists                            |
| Nominal Scenario | sc5.1(specified user is deleted)                                     |
|     Variants     | sc5.2(all users are deleted)                                         |
|    Exceptions    | sc5.3(specified user doesn't exist), sc5.4(specified user can't be deleted)|

#### Scenario 5.1 (specified user is deleted)

|  Scenario 5.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in                                     |
| Post condition | The specified user is deleted                                              |
|     Step#      |                                Description                                 |
|       1        | **User** asks to delete a user by providing the _username_                 |
|       2        | **System** check that the user with _username_ exists                      |
|       3        | **System** check for permissions to delete                                 |
|       4        | **System** delete the specified user                                       |

#### Scenario 5.2 (all users are deleted)

|  Scenario 5.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager and it's a test environment |
| Post condition | All users in the DB are deleted                                            |
|     Step#      |                                Description                                 |
|       1        | **User** asks to delete all users from the DB                              |
|       2        | **System** check that there are users in the DB                            |
|       3        | **System** check that it's a test environment                              |
|       4        | **System** delete all users from the DB                                    |

#### Scenario 5.3 (specified user doesn't exist)

|  Scenario 5.3  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in                                     |
| Post condition | The specified user is NOT deleted                                          |
|     Step#      |                                Description                                 |
|       1        | **User** asks to delete a user by providing the _username_                 |
|       2        | **System** check that the user with _username_ exists                      |
|       3        | **System** No match found                                                  |
|       4        | **System** return a 404 error to the user                                  |

#### Scenario 5.4 (specified user can't be deleted)

|  Scenario 5.4  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in                                     |
| Post condition | The specified user is deleted                                              |
|     Step#      |                                Description                                 |
|       1        | **User** asks to delete a user by providing the _username_                 |
|       2        | **System** check that the user with _username_ exists                      |
|       3        | **System** check for permissions to delete                                 |
|       4        | **System** permission denied                                               |
|       5        | **System** return a 404 error to the user                                       |

### UC6: Create new product

| Actors Involved  | Manager                                                              |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                      |
|  Post condition  | A new product is created                                             |
| Nominal Scenario | sc6.1(new product is created)                                        |
|     Variants     | sc6.2(a new set of products is registered)                            |
|    Exceptions    | sc6.3(product already exists), sc6.4(arrival date is after current date)|

#### Scenario 6.1 (new product is created)

|  Scenario 6.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager                  |
| Post condition | The new product it's added                                                 |
|     Step#      |                                Description                                 |
|       1        | **User** insert all the product parameters                                 |
|       2        | **User** send the requst with the parameters for the new product           |
|       3        | **System** check that the _code_ doesn't represent another product         |
|       4        | **System** check that the _arrivalDate_ isn't after the current date       |
|       5        | **System** add the new product to the DB and return its _code_             |

#### Scenario 6.2 (a new set of products is registered)

|  Scenario 6.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager                  |
| Post condition | The new set is registered                                                  |
|     Step#      |                                Description                                 |
|       1        | **User** insert the arrival set parameters                                 |
|       2        | **User** send the requst with the parameters for the new arrival set       |
|       3        | **System** check that the _model_ exists                                   |
|       4        | **System** check that the _arrivalDate_ isn't after the current date       |
|       5        | **System** add the new arrival set to the DB                               |

#### Scenario 6.3 (product already exists)

|  Scenario 6.3  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager                  |
| Post condition | The new product it's NOT added                                             |
|     Step#      |                                Description                                 |
|       1        | **User** insert all the product parameters                                 |
|       2        | **User** send the requst with the parameters for the new product           |
|       3        | **System** check that the _code_ doesn't represent another product         |
|       4        | **System** return a 409 error to the user                                  |

#### Scenario 6.4 (arrival date is after current date)

|  Scenario 6.4  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager                  |
| Post condition | The new product or arrival set it's NOT added                              |
|     Step#      |                                Description                                 |
|       1        | **User** insert all the product or arrival set parameters                  |
|       2        | **User** send the requst with the parameters                               |
|       3        | **System** check that the _code_ doesn't represent another product         |
|       4        | **System** check that the _arrivalDate_ isn't after the current date       |
|       5        | **System** return an error to the user                                     |

### UC7: Sold product

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                      |
|  Post condition  | The product is marked as sold                                        |
| Nominal Scenario | sc7.1(mark as sold)                                                  |
|     Variants     |                                                                      |
|    Exceptions    | sc7.2(product doesn't exist), sc7.3(product already sold), sc7.4(sellingDate is before arrivalDate), sc7.5(sellingDate is after current date) |

#### Scenario 7.1 (mark as sold)

|  Scenario  7.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                               |
| Post condition | The product is marked as sold                                       |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to mark the product as sold                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product that isn't sold    |
|       4        | **System** Match is found                                                  |
|       5        | **System** Mark the product as sold                                        |

#### Scenario 7.2 (product doesn't exist)

|  Scenario  7.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                               |
| Post condition | The product is not marked as sold                                      |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to mark the product as sold                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** No product is found   |
|       4        | **System** return a 404 error to user|

#### Scenario 7.3 (product already sold)

|  Scenario  7.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | The product is not marked as sold                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to mark the product as sold                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product that isn't sold    |
|       4        | **System** No product is found   |
|       5        | **System** return a 409 error to user                              |

#### Scenario 7.4  (sellingDate is before arrival Date)

|  Scenario  7.4 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | The product is not marked as sold                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to mark the product as sold                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product that isn't sold    |
|       4        | **System** check if the sellingdate is compatible with the arrivaldate     |
|       5        | **System** The selling date is before arrivalDate!                              |
|       6        | **System** return a 404 error to user                              |

#### Scenario 7.5  (sellingDate is after current Date)

|  Scenario  7.5 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | The product is not marked as sold                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to mark the product as sold                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product that isn't sold    |
|       4        | **System** check if the sellingdate is compatible with the arrivaldate     |
|       5        | **System** The selling date is after current date!                              |
|       6        | **System** return a 404 error to user                           |

### UC8: Get products

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                    |
|  Post condition  | An array of Product objects or a product is retrived                 |
| Nominal Scenario | sc8.1(get all products), sc8.2(get the requested product)            |
|     Variants     | sc8.3(get only sold/unsold products), sc8.4(get product by category), sc8.5(get product by model)|
|    Exceptions    | sc8.6(no products in the database), sc8.7(product doesn't exist)     |

#### Scenario 8.1  (get all products)

|  Scenario  8.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                                   |
| Post condition | An array of Product objects or a product is retrived                                         |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get all products                             |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** returns all the products in an array        |

#### Scenario 8.2  (get the requested product)

|  Scenario  8.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                                   |
| Post condition | An array of Product objects or a product is retrived                                         |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get a specific product                             |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** return an array containing one product|

#### Scenario 8.3  (get only sold/unsold products)

|  Scenario  8.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                                   |
| Post condition | An array of Product objects or a product is retrived                                         |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get a eihter sold or unsold products                             |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** return an array containing sold or unsold products|

#### Scenario 8.4  (get product by category)

|  Scenario  8.4 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                                   |
| Post condition | An array of Product objects or a product is retrived                                         |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get a specific category of products                             |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** return an array containing the required category of products|

#### Scenario 8.5  (get product by model)

|  Scenario  8.5 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                                   |
| Post condition | An array of Products objects or a product is retrived                                         |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get a specific model of products                             |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** return an array containing the required model of products|

#### Scenario 8.6(no products in the database)

|  Scenario  8.6 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                            |
| Post condition | NO products retrieved                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get specific products or all products                         |
|       2        | **System** check that the products are present in the database        |
|       3        | **System** No such match with the required!                              |
|       4        | **System** return a 404 error to user                           |

#### Scenario 8.7(product doesn't exist)

|  Scenario  8.6 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in                            |
| Post condition | NO product retrieved                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to get specific product                         |
|       2        | **System** check that the product is present in the database        |
|       3        | **System** No such match with the required!                              |
|       4        | **System** return a 404 error to user                           |

### UC9: Delete products

| Actors Involved  | Manager                                                              |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                      |
|  Post condition  | All products or a specified product are deleted                      |
| Nominal Scenario | sc9.1(Delete all the products), sc9.2(product is present and deleted )|
|     Variants     |                                                                      |
|    Exceptions    | sc9.3(product does not exist)                                        |

#### Scenario 9.1(Delete all the products)

|  Scenario  9.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | All products are deleted                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to delete all products                                  |
|       2        | **System** Empty the database from all the products                         |

#### Scenario 9.2(product is present and deleted)

|  Scenario  9.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | product is deleted                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to delete specific product                                  |
|       2        | **System** check that the product is present in the database        |
|       3        | **System** Delete the product from the database                      |

#### Scenario 9.3(product does not exist)

|  Scenario  9.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User is logged in, user has the role of Manager                            |
| Post condition | product is not deleted                                          |
|     Step#      |                                Description                                 |
|       1        | **User** user asks to delete specific product                                  |
|       2        | **System** check that the product is present in the database        |
|       3        | **System** No match is found                    |
|       4        | **System** return a 404 error                   |

### UC10: Get cart

| Actors Involved  | Customer                                                             |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Customer                     |
|  Post condition  | Get the cart of the user                                             |
| Nominal Scenario | sc10.1(get current cart)                                             |
|     Variants     | sc10.2(get carts history)                                            |
|    Exceptions    | sc10.3(couldn't get cart)                                            |

#### Scenario 10.1 (get current cart)

|  Scenario 10.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer                 |
| Post condition | Get the current cart of the user                                           |
|     Step#      |                                Description                                 |
|       1        | **User** ask for its current cart                                          |
|       2        | **System** check that the logged in user has a cart                        |
|       3        | **System** return the current cart to the user                             |

#### Scenario 10.2 (get carts history)

|  Scenario 10.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer                 |
| Post condition | Get list of the previous cart of the user                                  |
|     Step#      |                                Description                                 |
|       1        | **User** ask for its carts history                                         |
|       2        | **System** check that the logged in user has carts in his history          |
|       3        | **System** return the list of carts history to the user                    |

#### Scenario 10.3 (couldn't get cart)

|  Scenario 10.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer                 |
| Post condition | Can NOT get the current cart or carts history of the user                  |
|     Step#      |                                Description                                 |
|       1        | **User** ask for its current cart or carts history                         |
|       2        | **System** check that the logged in user has a cart                        |
|       3        | **System** return an error to the user                                     |

### UC11: Update cart

| Actors Involved  | Customer                                                             |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Customer                     |
|  Post condition  | The cart is updated                                                  |
| Nominal Scenario | sc11.1(add product to current cart)                                  |
|     Variants     | sc11.2(mark cart as payed)                                           |
|    Exceptions    | sc11.3(product doesn't exists), sc11.4(product already in a cart), sc11.5(product already sold), sc11.6(cart is empty)                           |

#### Scenario 11.1 (add product to current cart)

|  Scenario 11.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | A product is added to the user cart                                        |
|     Step#      |                                Description                                 |
|       1        | **User** ask to add a product to its cart                                  |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product already in the cart|
|       4        | **System** check if the _productId_ represent a product that isn't sold    |
|       5        | **System** add the product to the user current cart                        |

#### Scenario 11.2 (mark cart as payed)

|  Scenario 11.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The cart is marked as payed                                                |
|     Step#      |                                Description                                 |
|       1        | **User** ask to mark the current cart as payed                             |
|       2        | **System** check that the cart isn't empty                                 |
|       3        | **System** check that the cart isn't already payed                         |
|       4        | **System** mark the cart as payed                                          |

#### Scenario 11.3 (product doesn't exists)

|  Scenario 11.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT added to the user cart                                  |
|     Step#      |                                Description                                 |
|       1        | **User** ask to add a product to its cart                                  |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** return a 404 error to the user                                  |

#### Scenario 11.4 (product already in a cart)

|  Scenario 11.4 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT added to the user cart                                  |
|     Step#      |                                Description                                 |
|       1        | **User** ask to add a product to its cart                                  |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product already in the cart|
|       4        | **System** return a 409 error to the user                                  |

#### Scenario 11.5 (product already sold)

|  Scenario 11.5 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT added to the user cart                                  |
|     Step#      |                                Description                                 |
|       1        | **User** ask to add a product to its cart                                  |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product already in the cart|
|       4        | **System** check if the _productId_ represent a product that isn't sold    |
|       5        | **System** return a 409 error to the user                                  |

#### Scenario 11.6 (cart is empty)

|  Scenario 11.6 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The cart is NOT marked as payed                                            |
|     Step#      |                                Description                                 |
|       1        | **User** ask to mark the current cart as payed                             |
|       2        | **System** check that the cart isn't empty                                 |
|       3        | **System** return a 404 error to the user                                  |

### UC12: Delete cart

| Actors Involved  | Customer                                                             |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                    |
|  Post condition  | Delete cart or product in a cart                                     |
| Nominal Scenario | sc12.1(delete a product in current user cart)                        |
|     Variants     | sc12.2(delete current user cart), sc12.3(delete all carts in DB)     |
|    Exceptions    | sc12.4(product not in the cart), sc12.5(product already sold), sc12.6(product doesn't exists)|

#### Scenario 12.1 (delete a product in current user cart)

|  Scenario 12.1 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is deleted from the user cart                                 |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete a product from its cart                            |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product in the cart       |
|       4        | **System** delete the product from the user cart                          |

#### Scenario 12.2 (delete current user cart)

|  Scenario 12.2 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The current cart is deleted                                                |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete its current cart                                    |
|       2        | **System** delete the current cart                                         |

#### Scenario 12.3 (delete all carts in DB)

|  Scenario 12.3 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a manager, it's a test environment|
| Post condition | All carts in the DB are deleted                                           |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete all carts in the DB                                 |
|       2        | **System** delete all carts in the DB                                      |

#### Scenario 12.4 (product not in the cart)

|  Scenario 12.4 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT deleted from the user cart                              |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete a product from its cart                            |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product in the cart       |
|       4        | **System** return a 404 error to the user                                  |

#### Scenario 12.5 (product already sold)

|  Scenario 12.5 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT deleted from the user cart                              |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete a product from its cart                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** check if the _productId_ represent a product in the cart        |
|       4        | **System** check if the _productId_ represent a product that isn't sold    |
|       5        | **System** return a 409 error to the user                                  |

#### Scenario 12.6 (product doesn't exists)

|  Scenario 12.6 |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | User has an account, user is logged in, user is a customer, user has a cart|
| Post condition | The product is NOT deleted from the user cart                              |
|     Step#      |                                Description                                 |
|       1        | **User** ask to delete a product from its cart                             |
|       2        | **System** check that the _productId_ represent an existing product        |
|       3        | **System** return a 404 error to the user                                  |

### UC13: Add Image to Product

| Actors Involved  | Manager                                                              |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                      |
|  Post condition  | An image is added to the specified product                           |
| Nominal Scenario | sc13.1(Add image to product)                                         |
|     Variants     | sc13.2(Replace existing image with a new one)                        |
|    Exceptions    | sc13.3(Product doesn't exist), sc13.4(Invalid image format), sc13.5(Unable to upload image)|

#### Scenario 13.1 (Add image to product)

|  Scenario 13.1  |                                                                                   |
| :--------------: | :-------------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists                   |
|  Post condition  | An image is successfully added to the specified product                            |
|      Step#       |                                    Description                                    |
|        1         | **Manager** navigates to the product management section of the system             |
|        2         | **Manager** selects the product to which they want to add an image                 |
|        3         | **Manager** uploads the image file from their device                               |
|        4         | **System** validates the image format and size                                     |
|        5         | **System** If the image meets the requirements, it is successfully added to the product       |
|        6         | **System** confirms the successful addition of the image to the product            |

#### Scenario 13.2 (Replace existing image with a new one)

|  Scenario 13.2  |                                                                                  |
| :--------------: | :------------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product with existing image    |
|  Post condition  | The existing image of the product is replaced with the new image                 |
|      Step#       |                                     Description                                  |
|        1         | **Manager** navigates to the product management section of the system            |
|        2         | **Manager** selects the product for which they want to replace the image         |
|        3         | **Manager** uploads the new image file from their device                          |
|        4         | **System** validates the new image format and size                                |
|        5         | **System** If the new image meets the requirements, it replaces the existing image          |
|        6         | **System** confirms the successful replacement of the image                       |

#### Scenario 13.3 (Product doesn't exist)

|  Scenario 13.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                             |
|  Post condition  | No image is added as the product does not exist                              |
|      Step#       |                                  Description                                 |
|        1         | **Manager** attempts to add an image to a product that does not exist        |
|        2         | **System** checks if the product exists in the database                      |
|        3         | **System** returns an error message indicating that the product does not exist|

#### Scenario 13.4 (Invalid image format)

|  Scenario 13.4  |                                                                                   |
| :--------------: | :-------------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists                   |
|  Post condition  | No image is added as the uploaded image has an invalid format                     |
|      Step#       |                                     Description                                   |
|        1         | **Manager** navigates to the product management section of the system             |
|        2         | **Manager** selects the product to which they want to add an image                 |
|        3         | **Manager** uploads the image file from their device                               |
|        4         | **System** validates the image format and size                                     |
|        5         | **System** If the image format is invalid, the system rejects the upload                      |
|        6         | **System** informs the manager about the invalid image format                      |

#### Scenario 13.5 (Unable to upload image)

|  Scenario 13.5  |                                                                                   |
| :--------------: | :-------------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists                   |
|  Post condition  | No image is added as the system is unable to upload the image                     |
|      Step#       |                                     Description                                   |
|        1         | **Manager** navigates to the product management section of the system             |
|        2         | **Manager** selects the product to which they want to add an image                 |
|        3         | **Manager** attempts to upload the image file from their device                    |
|        4         | **System** encounters an error while uploading the image                           |
|        5         | **System** informs the manager that the image could not be uploaded                |

### UC14: Edit User Information

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                    |
|  Post condition  | User information is successfully updated                             |
| Nominal Scenario | sc14.1(Edit user information)                                        |
|     Variants     | sc14.2(Change password)                                              |
|    Exceptions    | sc14.3(Invalid input), sc14.4(Unable to update information)          |

#### Scenario 14.1 (Edit user information)

|  Scenario 14.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                          |
|  Post condition  | User information is successfully updated                                   |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the profile or settings section of the system         |
|        2         | **User** selects the option to edit their information                       |
|        3         | **User** modifies the desired information (e.g., name, email, password)     |
|        4         | **System** validates the updated information                               |
|        5         | **System** If the information is valid, it is successfully updated in the system       |
|        6         | **System** confirms the successful update to the user                       |

#### Scenario 14.2 (Unable to edit user information)

|  Scenario 14.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                          |
|  Post condition  | User information remains unchanged due to an error                          |
|      Step#       |                                  Description                                 |
|        1         | **User** attempts to edit their information in the profile or settings section of the system |
|        2         | **System** encounters an error while processing the request                 |
|        3         | **System** notifies the user that their information could not be updated    |

#### Scenario 14.3 (Edit user information with invalid data)

|  Scenario 14.3  |                                                                             |
| :--------------: | :-------------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                           |
|  Post condition  | User information remains unchanged due to invalid or incomplete data        |
|      Step#       |                                  Description                                  |
|        1         | **User** navigates to the profile or settings section of the system          |
|        2         | **User** selects the option to edit their information                        |
|        3         | **User** modifies their information, but enters invalid or incomplete data   |
|        4         | **System** attempts to validate the updated information                      |
|        5         | **System** detects the invalid or incomplete data and notifies the user      |
|        6         | **User** corrects the information and resubmits the form                     |
|        7         | **System** If the corrected information is valid, it is successfully updated in the system |
|        8         | **System** confirms the successful update to the user                        |

#### Scenario 14.4 (Edit user information with duplicate email)

|  Scenario 14.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                          |
|  Post condition  | User information remains unchanged due to a duplicate email                |
|      Step#       |                                  Description                                 |
|        1         | **User** attempts to edit their information in the profile or settings section of the system |
|        2         | **User** modifies their email address to an email that already exists in the system |
|        3         | **System** attempts to validate the updated email address                   |
|        4         | **System** detects the duplicate email and notifies the user                |
|        5         | **User** corrects the email address and resubmits the form                  |
|        6         | **System** If the corrected email address is valid, it is successfully updated in the system |
|        7         | **System** confirms the successful update to the user                       |

### UC15: Edit Product

| Actors Involved  | Manager                                                              |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager                      |
|  Post condition  | The specified product is successfully updated                        |
| Nominal Scenario | sc15.1(Edit product information)                                     |
|     Variants     | sc15.2(Change product details), sc15.3(Change product category), sc15.4(Change product price)|
|    Exceptions    | sc15.5(Product doesn't exist), sc15.6(Unable to update product information)|

#### Scenario 15.1 (Edit product details)

|  Scenario 15.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details are successfully updated                                   |
|      Step#       |                                  Description                                 |
|        1         | **Manager** navigates to the product management section of the system       |
|        2         | **Manager** selects the product they want to edit                          |
|        3         | **Manager** modifies the desired details of the product (e.g., name, price, description) |
|        4         | **System** validates the updated details                                   |
|        5         | **System** If the details are valid, they are successfully updated in the system       |
|        6         | **System** confirms the successful update to the manager                    |

#### Scenario 15.2 (Unable to edit product details)

|  Scenario 15.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details remain unchanged due to an error                            |
|      Step#       |                                  Description                                 |
|        1         | **Manager** attempts to edit the details of a product in the system         |
|        2         | **System** encounters an error while processing the request                 |
|        3         | **System** notifies the manager that the product details could not be updated|

#### Scenario 15.3 (Edit product details with invalid data)

|  Scenario 15.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details remain unchanged due to invalid or incomplete data         |
|      Step#       |                                  Description                                 |
|        1         | **Manager** navigates to the product management section of the system       |
|        2         | **Manager** selects the product they want to edit                          |
|        3         | **Manager** modifies the details of the product, but enters invalid or incomplete data |
|        4         | **System** attempts to validate the updated details                       |
|        5         | **System** detects the invalid or incomplete data and notifies the manager |
|        6         | **Manager**  corrects the information and resubmits the form                |
|        7         | **System** If the corrected information is valid, it is successfully updated in the system |
|        8         | **System** confirms the successful update to the manager                   |

#### Scenario 15.4 (Edit product details with duplicate name)

|  Scenario 15.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details remain unchanged due to a duplicate name                    |
|      Step#       |                                  Description                                 |
|        1         | **Manager** attempts to edit the details of a product in the system         |
|        2         | **Manager** modifies the name of the product to a name that already exists in the system |
|        3         | **System** attempts to validate the updated product name                   |
|        4         | **System** detects the duplicate name and notifies the manager              |
|        5         | **manager** corrects the product name and resubmits the form               |
|        6         | **System** If the corrected product name is valid, it is successfully updated in the system |
|        7         | **System** confirms the successful update to the manager                   |

#### Scenario 15.5 (Edit product details with invalid price)

|  Scenario 15.5  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details remain unchanged due to an invalid price                    |
|      Step#       |                                  Description                                 |
|        1         | **Manager** attempts to edit the details of a product in the system         |
|        2         | **Manager** modifies the price of the product to an invalid value           |
|        3         | **System** attempts to validate the updated price                          |
|        4         | **System** detects the invalid price and notifies the manager               |
|        5         | **Manager** corrects the price and resubmits the form                      |
|        6         | **System**If the corrected price is valid, it is successfully updated in the system  |
|        7         | **System** confirms the successful update to the manager                   |

#### Scenario 15.6 (Edit product details with invalid description)

|  Scenario 15.6  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager, product exists            |
|  Post condition  | Product details remain unchanged due to an invalid description              |
|      Step#       |                                  Description                                 |
|        1         | **Manager** attempts to edit the details of a product in the system         |
|        2         | **Manager** modifies the description of the product to an invalid value     |
|        3         | **System** attempts to validate the updated description                    |
|        4         | **System** detects the invalid description and notifies the manager         |
|        5         | **Manager** corrects the description and resubmits the form                |
|        6         | **System**If the corrected description is valid, it is successfully updated in the system |
|        7         | **System** confirms the successful update to the manager                   |

### UC16: Forgot Password

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User forgot password                                                 |
|  Post condition  | User successfully resets the password                                |
| Nominal Scenario | sc16.1(User requests password reset)                                 |
|     Variants     | sc16.2(Receive password reset link via email)                        |
|    Exceptions    | sc16.3(Invalid username/email), sc16.4(Unable to send reset link)    |

#### Scenario 16.1 (Forgot password)

|  Scenario 16.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User has an account registered with the system                             |
|  Post condition  | User successfully resets their password                                    |
|      Step#       |                                  Description                                 |
|        1         | **User** clicks on the "Forgot password" link on the login page            |
|        2         | **System** prompts the user to enter their email address                   |
|        3         | **User** enters their email address and submits the form                   |
|        4         | **System** verifies the email address and sends a password reset link to the user's email |
|        5         | **User** checks their email inbox for the password reset link              |
|        6         | **User** clicks on the password reset link in the email                    |
|        7         | **System** validates the password reset link and prompts the user to create a new password |
|        8         | **User** enters a new password and submits the form                        |
|        9         | **System** updates the user's password and confirms the password reset     |

#### Scenario 16.2 (Forgot password with invalid email)

|  Scenario 16.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User has an account registered with the system                             |
|  Post condition  | User receives an error message indicating the invalid email                |
|      Step#       |                                  Description                                 |
|        1         | **User** clicks on the "Forgot password" link on the login page            |
|        2         | **System** prompts the user to enter their email address                   |
|        3         | **User** enters an invalid email address and submits the form              |
|        4         | **System** attempts to verify the email address                             |
|        5         | **System** detects that the email address is invalid and notifies the user  |
|        6         | **User** is prompted to enter a valid email address and submit the form    |

#### Scenario 16.3 (Forgot password with no registered email)

|  Scenario 16.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User does not have an account registered with the system                   |
|  Post condition  | User receives an error message indicating the email is not registered      |
|      Step#       |                                  Description                                 |
|        1         | **User** clicks on the "Forgot password" link on the login page            |
|        2         | **System** prompts the user to enter their email address                   |
|        3         | **User** enters their email address and submits the form                   |
|        4         | **System** attempts to verify the email address                             |
|        5         | **System** detects that the email address is not registered and notifies the user |
|        6         | **User** is prompted to register for an account or to enter a valid email address |

#### Scenario 16.4 (Forgot password link expiration)

|  Scenario 16.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User has requested a password reset link                                   |
|  Post condition  | User receives an error message indicating the password reset link has expired |
|      Step#       |                                  Description                                 |
|        1         | **User** clicks on the password reset link in the email                    |
|        2         | **System** validates the password reset link                               |
|        3         | **System** detects that the password reset link has expired                |
|        4         | **System** notifies the user that the password reset link has expired      |
|        5         | **User** is prompted to request a new password reset link                  |

### UC17: Payment System

| Actors Involved  | Customer,Manager                                                     |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Manager or Customer          |
|  Post condition  | Payment system is successfully integrated                            |
| Nominal Scenario | sc17.1(Add payment system functionality)                             |
|     Variants     | sc17.2(Choose payment method), sc17.3(Confirm payment)               |
|    Exceptions    | sc17.4(Payment method not available), sc17.5(Unable to process payment)|

#### Scenario 17.1 (Adding payment system)

|  Scenario 17.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Administrator or Manager           |
|  Post condition  | Payment system is successfully integrated into the system                 |
|      Step#       |                                  Description                                 |
|        1         | **Administrator/Manager** initiates the process to add a payment system   |
|        2         | **System** prompts the user to provide details of the payment system (e.g., API keys, merchant ID) |
|        3         | **Administrator/Manager** enters the required details and submits the form |
|        4         | **System** validates the provided information                             |
|        5         | **System** If the information is valid, the payment system is successfully integrated |
|        6         | **System** confirms the successful integration to the user               |

#### Scenario 17.2 (Adding payment system with invalid details)

|  Scenario 17.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Administrator or Manager           |
|  Post condition  | Payment system integration fails due to invalid details                    |
|      Step#       |                                  Description                                 |
|        1         | **Administrator/Manager** initiates the process to add a payment system   |
|        2         | **System** prompts the user to provide details of the payment system (e.g., API keys, merchant ID) |
|        3         | **Administrator/Manager** enters invalid or incomplete details and submits the form |
|        4         | **System** attempts to validate the provided information                 |
|        5         | **System** detects that the information is invalid or incomplete and notifies the user |
|        6         | **Administrator/Manager** corrects the details and resubmits the form    |
|        7         | **System** If the corrected information is valid, the payment system is successfully integrated |
|        8         | **System** confirms the successful integration to the user               |

#### Scenario 17.3 (Adding payment system without sufficient permissions)

|  Scenario 17.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user does not have the necessary permissions (Administrator or Manager) to add payment system |
|  Post condition  | Payment system integration fails due to insufficient permissions           |
|      Step#       |                                  Description                                 |
|        1         | **User** attempts to initiate the process to add a payment system         |
|        2         | **System** verifies the user's permissions                                 |
|        3         | **System** detects that the user does not have the necessary permissions  |
|        4         | **System** notifies the user that they do not have sufficient permissions  |
|        5         | **User** with appropriate permissions needs to perform the action         |

#### Scenario 17.4 (Payment system integration failure)

|  Scenario 17.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Administrator or Manager           |
|  Post condition  | Payment system integration fails due to technical issues or errors         |
|      Step#       |                                  Description                                 |
|        1         | **Administrator/Manager** initiates the process to add a payment system   |
|        2         | **System** prompts the user to provide details of the payment system (e.g., API keys, merchant ID) |
|        3         | **Administrator/Manager** enters the required details and submits the form |
|        4         | **System** attempts to integrate the payment system                         |
|        5         | **System** encounters technical issues or errors during the integration process |
|        6         | **System** notifies the user that the payment system integration has failed |
|        7         | **User** may try to resolve the issues or contact support for assistance   |

#### Scenario 17.5 (Successful payment system integration)

|  Scenario 17.5  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has the role of Administrator or Manager           |
|  Post condition  | Payment system is successfully integrated into the system                 |
|      Step#       |                                  Description                                 |
|        1         | **Administrator/Manager** initiates the process to add a payment system   |
|        2         | **System** prompts the user to provide details of the payment system (e.g., API keys, merchant ID) |
|        3         | **Administrator/Manager** enters the required details and submits the form |
|        4         | **System** validates the provided information                             |
|        5         | **System** If the information is valid, the payment system is successfully integrated |
|        6         | **System** confirms the successful integration to the user               |

### UC18: Add Reviews

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is logged in                                                    |
|  Post condition  | Review is successfully added to the specified product                |
| Nominal Scenario | sc18.1(Add review to product)                                        |
|     Variants     | sc18.2(Provide rating along with review), sc18.3(Edit/Delete review) |
|    Exceptions    | sc18.4(Product doesn't exist), sc18.5(Unable to add review)          |

#### Scenario 18.1 (Adding reviews)

|  Scenario 18.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has made a purchase                                |
|  Post condition  | Review is successfully added for the purchased product                      |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of the purchased product            |
|        2         | **User** locates the section for adding reviews and clicks on "Add Review" |
|        3         | **System** prompts the user to enter their review (e.g., rating, comments) |
|        4         | **User** enters their review and submits the form                          |
|        5         | **System** validates the review and adds it to the product's reviews       |
|        6         | **System** The review is now visible to other users browsing the product page         |

#### Scenario 18.2 (Adding reviews without a purchase)

|  Scenario 18.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has not made a purchase                           |
|  Post condition  | Review is not added for the product as the user has not made a purchase    |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a product they have not purchased|
|        2         | **User** locates the section for adding reviews and clicks on "Add Review" |
|        3         | **System** prevents the user from adding a review and displays a message indicating that a purchase is required |
|        4         | **User** is unable to proceed with adding a review                         |

#### Scenario 18.3 (Adding a review with invalid or incomplete information)

|  Scenario 18.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has made a purchase                                |
|  Post condition  | Review is not added for the product due to invalid or incomplete information|
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of the purchased product            |
|        2         | **User** locates the section for adding reviews and clicks on "Add Review" |
|        3         | **System** prompts the user to enter their review (e.g., rating, comments) |
|        4         | **User** enters incomplete or invalid information and submits the form     |
|        5         | **System** detects the incomplete or invalid information and notifies the user |
|        6         | **User** corrects the information and resubmits the review form            |
|        7         | **System** If the corrected information is valid, the review is successfully added    |

#### Scenario 18.4 (Adding a review successfully)

|  Scenario 18.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has made a purchase                                |
|  Post condition  | Review is successfully added for the purchased product                      |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of the purchased product            |
|        2         | **User** locates the section for adding reviews and clicks on "Add Review" |
|        3         | **System** prompts the user to enter their review (e.g., rating, comments) |
|        4         | **User** enters their review and submits the form                          |
|        5         | **System** validates the review and adds it to the product's reviews       |
|        6         | **System** The review is now visible to other users browsing the product page         |

#### Scenario 18.5 (Editing a review)

|  Scenario 18.5  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is logged in, user has previously added a review for a product        |
|  Post condition  | Review is successfully edited with updated information                    |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page containing their reviewed product  |
|        2         | **User** locates their previously added review and selects "Edit" option  |
|        3         | **System** retrieves the user's review and displays it for editing        |
|        4         | **User** modifies the review content (e.g., rating, comments) as desired  |
|        5         | **User** submits the edited review form                                  |
|        6         | **System** validates the edited review and updates it in the system       |
|        7         | **System** The edited review is now visible to other users browsing the product page |

### UC19: Suggest Similar Products

| Actors Involved  | User                                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | User is viewing a product                                            |
|  Post condition  | User is provided with a list of similar products                     |
| Nominal Scenario | sc19.1(Get suggested similar products)                               |
|     Variants     | sc19.2(Based on user preferences), sc19.3(Based on product category) |
|    Exceptions    | sc19.4(No similar products found), sc19.5(Unable to retrieve suggestions)|

#### Scenario 19.1 (Suggesting similar products)

|  Scenario 19.1  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is browsing a product page                                           |
|  Post condition  | User is presented with a list of similar products                          |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a specific product              |
|        2         | **System** identifies the category or features of the current product      |
|        3         | **System** searches the database for products with similar attributes or characteristics |
|        4         | **System** retrieves a list of similar products                            |
|        5         | **System** displays the list of similar products to the user               |

#### Scenario 19.2 (No similar products found)

|  Scenario 19.2  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is browsing a product page                                           |
|  Post condition  | User is informed that no similar products were found                       |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a specific product              |
|        2         | **System** identifies the category or features of the current product      |
|        3         | **System** searches the database for products with similar attributes or characteristics |
|        4         | **System** does not find any similar products                              |
|        5         | **System** informs the user that no similar products were found             |

#### Scenario 19.3 (Error while suggesting similar products)

|  Scenario 19.3  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is browsing a product page                                           |
|  Post condition  | User encounters an error while the system tries to suggest similar products|
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a specific product              |
|        2         | **System** identifies the category or features of the current product      |
|        3         | **System** attempts to search the database for products with similar attributes or characteristics |
|        4         | **System**An error occurs during the search process                                 |
|        5         | **System** displays an error message to the user                           |
|        6         | **User** may try again later or contact support for assistance              |

#### Scenario 19.4 (User opts out of similar product suggestions)

|  Scenario 19.4  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is browsing a product page                                           |
|  Post condition  | User chooses to opt out of receiving similar product suggestions           |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a specific product              |
|        2         | **User** encounters a section suggesting similar products                  |
|        3         | **User** selects an option to opt out of receiving similar product suggestions |
|        4         | **System** records the user's preference and does not suggest similar products in the future |

#### Scenario 19.5 (User ignores similar product suggestions)

|  Scenario 19.5  |                                                                            |
| :--------------: | :------------------------------------------------------------------------: |
|   Precondition   | User is browsing a product page                                           |
|  Post condition  | User continues browsing without interacting with the similar product suggestions |
|      Step#       |                                  Description                                 |
|        1         | **User** navigates to the product page of a specific product              |
|        2         | **User** encounters a section suggesting similar products                  |
|        3         | **User** chooses not to interact with the similar product suggestions and continues browsing |
|        4         | **User** proceeds with their browsing activities without selecting any of the suggested similar products |

# Glossary

![Glossary V2](./img/glossary-ezelectronics-v2.png)


# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

![Deployment Diagram V2](./img/deployment-ezelectronics-v2.png)
