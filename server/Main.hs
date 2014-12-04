{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

import Prelude hiding (readFile)
import Web.Scotty
import Data.Aeson (FromJSON, ToJSON, toJSON)
import Data.Text
import qualified Data.Text.Lazy as TL
import GHC.Generics
import Data.Monoid ((<>))
import Network.Wai.Middleware.Static
import Control.Applicative ((<$>), pure)
import Data.Maybe (fromMaybe)
import System.Environment (lookupEnv)
import Data.Time.Format
import Data.Time.Calendar
import System.Locale
import Control.Monad
import Control.Monad.IO.Class (liftIO)
import Data.Vector (Vector)

import Data.Csv
import Data.ByteString (ByteString)
import Data.ByteString.Lazy (readFile)
import qualified Data.ByteString.Char8 as BSC

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

publicFolder = "public"

main = do
  port <- fromMaybe "3000" <$> lookupEnv "PORT"
  putStrLn $ "Listening on:" ++ port    

  scotty (read port) $ do

    middleware $ staticPolicy (noDots >-> addBase publicFolder)

    get "/entries" $ do
      c <- liftIO $ readFile "data/data.csv"
      let entries = decode HasHeader c :: Either String (Vector Entry)
      case entries of
        Left  err     -> raise (TL.pack err)
        Right entries -> json entries

    get (regex ".*") $ file (publicFolder <> "/index.html")

-- read the file into your types

