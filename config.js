

/**
 * Configuration for Clocktower. Edit as you need. Here it's set
 * to run on OpenShift and locally.
 */
module.exports = {
	server_ip : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	server_port : process.env.OPENSHIFT_NODEJS_PORT || 3000
}