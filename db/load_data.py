"""
run "python load_data.py "

"""
import os
import traceback
import json
import datetime
import time
from pymongo import MongoClient

DB_NAME = "wiki"
ADMINS_COLL = "admins"
BOTS_COLL = "bots"
ARTICLES_COLL = "articles"

DATA_FOLDER = "./data"
REVISIONS_FOLDER = "revisions"
ADMIN_FILE = "admin.txt"
BOT_FILE = "bot.txt"

DATA_PATH = os.path.abspath(DATA_FOLDER)
REVISIONS_PATH = os.path.join(DATA_PATH, REVISIONS_FOLDER)
ADMIN_PATH = os.path.join(DATA_PATH, ADMIN_FILE)
BOT_PATH =  os.path.join(DATA_PATH, BOT_FILE)

def load_admins(db):
    print "loading admins... from " + ADMIN_PATH
    admins = []
    coll = db[ADMINS_COLL]
    try:
        with open(ADMIN_PATH) as fp:
            content = fp.readlines()
        admins = [x.strip() for x in content]
        coll.insert_many([{"_id":admin} for admin in admins])
    except Exception, e:
        print(e)
        print(traceback.format_exc())
    return admins

def load_bots(db):
    print "loading bots...from " + BOT_PATH
    bots = []
    coll = db[BOTS_COLL]
    try:
        with open(BOT_PATH) as fp:
            content = fp.readlines()
        bots = [x.strip() for x in content]
        coll.insert_many([{"_id":bot} for bot in bots])
    except Exception, e:
        print(e)
        print(traceback.format_exc())
    return bots

def load_revisions(db, admins, bots):
    print "loading revisions... from " +  REVISIONS_PATH
    print 'admins: ', len(admins)
    print 'bots: ', len(bots)
    files = [f for f in os.listdir(REVISIONS_PATH) if os.path.isfile(os.path.join(REVISIONS_PATH, f))]
    coll = db[ARTICLES_COLL]
    for f in files:
        try:
            f_path = os.path.join(REVISIONS_PATH, f)
            print "Reading and loading ", f
            with open(f_path) as fp:
                data = json.load(fp)
            doc = {"_id":None, "revisions": []}
            for rec in data:
                if not doc["_id"]:
                    doc["_id"] = rec["title"]
                del rec["title"]
                dt = datetime.datetime.strptime(rec["timestamp"],"%Y-%m-%dT%H:%M:%Sz")
                rec["time"] = time.mktime(dt.timetuple())
                rec["year"] = dt.year
                usertype = "regular"
                if "anon" in rec:
                    usertype = "anon"
                elif "user" in rec:
                    if str(rec["user"]) in bots:
                        usertype = "bot"
                    elif str(rec["user"]) in admins:
                        usertype = "admin"
                rec["usertype"] = usertype
                doc["revisions"].append(rec)
            coll.insert(doc)

        except Exception, e:
            print("Error while reading file %s : %s", f_path, e)
            print(traceback.format_exc())
            
        
if __name__ == "__main__":
    start = time.time()
    client = MongoClient()
    db = client["wiki"]
    admins = load_admins(db)
    bots = load_bots(db)
    load_revisions(db, admins, bots)
    print "Time taken - ", (time.time() - start) / 60, " min"
