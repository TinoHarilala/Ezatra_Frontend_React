export const validName = new RegExp(
    '^[A-Za-z0-9]{4,20}$'
);
export const validPassword = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[./!@#\$%\^&\*])(?=.{8,})"
);