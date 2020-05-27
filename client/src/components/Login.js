import React, { useState } from "react";
import {
  LinearProgress,
  Checkbox,
  Grid,
  Box,
  TextField,
  FormControlLabel,
  CssBaseline,
  Button,
  Avatar,
  Typography,
  Container,
  Link,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import IconLogo from "./IconLogo";
import { withStyles } from "@material-ui/core/styles";
//import axios from "axios";
//import { useAuth } from "../context/auth";
//import Copyright from "components/Copyright";
//import { useHistory } from "react-router-dom";

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  submitText: {
    color: "white",
  },
  forgetPassword: {
    margin: theme.spacing(2, 0),
  },
});


const Login = (props) => {
  //const { setAuthToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const {
    touched,
    errors,
    isSubmitting,
    handleChange: onChange,
    handleBlur: onBlur,
    handleSubmit,
  } = {};
  const { classes } = props;

  if (isSubmitting) {
    return (
      <Typography component="h3" variant="h5">
        <LinearProgress />
        Vent venligst...
      </Typography>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/*
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        */}
        <IconLogo/>
        <Box m={2} />
        <Typography variant="h2" >Admin Panel</Typography>
        {/*
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        */}
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="username"
            name="email"
            autoComplete="email"
            helperText={""/*touched.email ? errors.email : ""*/}
            error={""/*touched.email && Boolean(errors.email)*/}
            onChange={onChange}
            onBlur={onBlur}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="password"
            type="password"
            id="password"
            autoComplete="current-password"
            helperText={""/*touched.password ? errors.password : ""*/}
            error={""/*touched.password && Boolean(errors.password)*/}
            onChange={onChange}
            onBlur={onBlur}
          />
          <Grid container justify="space-between">
            <Grid item>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="remember me"
              />
            </Grid>
            <Grid item>
              <Box className={classes.forgetPassword}>
                <Link href="/reset_password" variant="body2">
                  Forgot password?
                </Link>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="error">
            {errorMessage}
          </Typography>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            <Typography className={classes.submitText} >LOGIN</Typography>
          </Button>
          {/*
          <Grid container justify="center">
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Har du ikke en konto? Opret bruger"}
              </Link>
            </Grid>
          </Grid>
          */}
        </form>
      </div>
    </Container>
  );
};

export default withStyles(styles)(Login);
