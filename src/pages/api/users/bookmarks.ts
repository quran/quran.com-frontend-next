/* eslint-disable react-func/max-lines-per-function */
import cookie from 'cookie'
import type { NextApiResponse } from 'next'

import withProtect from 'src/middleware/withProtect'
import withRefreshToken from 'src/middleware/withRefreshToken'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME
} from 'src/utils/auth/constants'
import { getAuthApiPath } from 'src/utils/url'
import NextApiRequestWithTokens from 'types/NextApiRequestWithTokens'

const getAccessToken = (req) => {
  return req.accessToken || req.cookies[ACCESS_TOKEN_COOKIE_NAME]
}

const fetchBookmarks = (accessToken) =>
  fetch(getAuthApiPath('bookmarks'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      // eslint-disable-next-line i18next/no-literal-string
      Authorization: `bearer ${accessToken}`
    }
  })

const setAccessToken = (req, res, jsonResponse) => {
  if (req.accessToken && req.refreshToken) {
    return res.json({
      success: true,
      data: jsonResponse,
      cookies: [
        cookie.serialize(ACCESS_TOKEN_COOKIE_NAME, req.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: true,
          // maxAge: accessTokenExpiresInSeconds, // TODO: update this
          path: '/'
        }),
        cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, req.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: true,
          // maxAge: refreshTokenExpiresInSeconds, // TODO: update this
          path: '/'
        })
      ]
    })
  }
}

const getBookmarksByUserId = async (req, res) => {
  const accessToken = getAccessToken(req)
  const response = await fetchBookmarks(accessToken)
  const jsonResponse = await response.json()
  // TODO: make this a util
  setAccessToken(req)
  return res.json({ success: true, data: jsonResponse })
}

const fetchAddbookmark = (accessToken, chapterNumber, verseNumber) => {
  console.log(accessToken, chapterNumber, verseNumber)
  return fetch(getAuthApiPath('bookmarks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${accessToken}`
    },
    body: JSON.stringify({ chapterNumber, verseNumber })
  })
}

const addBookmark = async (req, res) => {
  const accessToken = getAccessToken(req)
  const { chapterNumber, verseNumber } = JSON.parse(req.body)
  const jsonResponse = await fetchAddbookmark(
    accessToken,
    chapterNumber,
    verseNumber
  )
  setAccessToken(req, res, jsonResponse)
  return res.json({ success: true })
}

const handler = async (req: NextApiRequestWithTokens, res: NextApiResponse) => {
  if (req.method === 'GET') return getBookmarksByUserId(req, res)
  if (req.method === 'POST') return addBookmark(req, res)
}

export default withRefreshToken(withProtect(handler))
