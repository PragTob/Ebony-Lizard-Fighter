#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({'.webapp': 'application/x-web-app-manifest+json'})

if __name__ == '__main__':
    PORT = 8000
    httpd = SocketServer.TCPServer(("", PORT), Handler)
    print "serving at port", PORT
    httpd.serve_forever()
