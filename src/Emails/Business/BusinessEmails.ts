import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { google } from "googleapis";

import { EnvironmentVariables } from "../../Config/EnvironmentVariables";

const clientId = EnvironmentVariables.google_id;
const clientSecret = EnvironmentVariables.google_secret;
const refreshToken =
  "1//04GUtuw7JeuxYCgYIARAAGAQSNwF-L9IroTMvzhkr6oNRxm63Cima8oRzQU4tIsivTj9EPBmDL9qUatQODhDhkP0qbP4qut3HUdE";

const GOOGLE_REDIRECT = EnvironmentVariables.google_redirectToken;

const oAuth = new google.auth.OAuth2(clientId, clientSecret, GOOGLE_REDIRECT);
oAuth.setCredentials({ refresh_token: refreshToken });

// Verify account/email by taking OTP from email
export const AccountVerificationEmail = async (user: any) => {
  const accessToken: any = (await oAuth.getAccessToken()).token;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EnvironmentVariables.user,
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
    },
  });

  const loadFile = path.join(
    __dirname,
    "../../Views/Business/BusinessSignup.ejs"
  );

  const ReadUserData = await ejs.renderFile(loadFile, {
    name: user.name,
    email: user.email,
    OTP: user.OTP,
  });

  const mailOptions = {
    from: EnvironmentVariables.from,
    to: user?.email,
    subject: "Welcome to Gift Aza - Your Path to Financial Success",
    html: ReadUserData,
  };

  transport
    .sendMail(mailOptions)
    .then(() => {
      console.log("Verification Email Sent..");
    })
    .catch((err) => {
      console.log("An error occured in sending welcome email", err);
    });
};

// Login notification email:
export const BusinessLoginNotification = async (
  user: any,
  deviceName: any,
  loginTimestamp: any
) => {
  const accessToken: any = (await oAuth.getAccessToken()).token;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EnvironmentVariables.user,
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
    },
  });

  const loadFile = path.join(
    __dirname,
    "../../Views/Business/LoginNotification.ejs"
  );

  const ReadUserData = await ejs.renderFile(loadFile, {
    name: user.name,
    devicename: deviceName,
    logintime: loginTimestamp,
  });

  const mailOptions = {
    from: EnvironmentVariables.from,
    to: user?.email,
    subject: "You Logged In",
    html: ReadUserData,
  };

  transport
    .sendMail(mailOptions)
    .then(() => {
      console.log("Login Notification..");
    })
    .catch((err) => {
      console.log("An error occured in sending login notification email", err);
    });
};
