{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

import System.Environment
import Prelude hiding (readFile)
import Data.Aeson (ToJSON, toJSON)
import qualified Data.Aeson as A
import Data.Text hiding (empty, head)
import GHC.Generics
import Control.Applicative (pure)
import Data.Time.Format
import Data.Time.Calendar
import System.Locale
import Control.Monad
import Data.Vector (Vector, empty, toList)

import Data.Csv
import Data.ByteString (ByteString)
import Data.ByteString.Lazy (readFile)
import qualified Data.ByteString.Lazy.Char8 as BSLC
import qualified Data.ByteString.Char8 as BSC

dayFormat :: String
dayFormat = "%Y-%m-%d"

data Entry = Entry {
   date :: Day,
   entryType :: Text,
   name :: Text,
   imageUrl :: Text,
   comment :: Text,
   url :: Text
} deriving (Show, Generic)

instance FromRecord Entry
instance ToJSON Entry

instance ToJSON Day where
  toJSON day = toJSON $ formatDate day

instance FromField Day where
  parseField s = case parseDate s of
      Nothing -> mzero
      Just d  -> pure d

parseDate :: ByteString -> Maybe Day
parseDate = parseTime defaultTimeLocale dayFormat . BSC.unpack

formatDate :: Day -> String
formatDate = formatTime defaultTimeLocale dayFormat

main :: IO ()
main = do
  args <- getArgs
  entries <- readEntries (head args)
  putStr "var ENTRIES = "
  BSLC.putStrLn $ A.encode $ toList entries
  return ()

readEntries :: String -> IO (Vector Entry)
readEntries input = do
  c <- readFile input
  let entries = decode HasHeader c :: Either String (Vector Entry)
  case entries of
    Left  err     -> do
      putStrLn ("Could not parse" ++ err)
      return empty
    Right es -> return es


