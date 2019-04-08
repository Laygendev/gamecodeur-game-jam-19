/**
 * @fileOverview Create express Server, add static folder: lib, shared, asset
 * and src.
 *
 * Send index.html file and call create tankServer.
 * When io connection is called, call handleSocket method from tankServer
 * Object.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Server } from './Server'

new Server() // eslint-disable-line
